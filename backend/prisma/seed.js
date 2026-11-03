require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const cloudinary = require("../lib/cloudinary");
const prisma = require("./prismaClient");

// ---------------- Config ----------------
const CONFIG = {
    users: 15,
    posts: 40,
    comments: 100,
    votes: 300,
    follows: 40,
    password: "password123",
    daysBack: 30,
};

const DATA_DIR = path.join(__dirname, "seed-data");
const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

// Fixed seed = same usernames every run. That's what makes re-running safe:
// users that already exist get skipped instead of duplicated.
faker.seed(2026);

// ---------------- Helpers ----------------
const now = () => new Date();
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const later = (a, b) => (a > b ? a : b);
const between = (from, to) => faker.date.between({ from, to: to < from ? from : to });
const pick = (arr) => faker.helpers.arrayElement(arr);
const chance = (p) => faker.number.float({ min: 0, max: 1 }) < p;

function weightedPick(items, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = faker.number.float({ min: 0, max: total });
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
    }
    return items[items.length - 1];
}

// Zipf-ish weights: a few items get most of the attention, like a real network
const skewedWeights = (n) => Array.from({ length: n }, (_, i) => 1 / (i + 1) ** 0.7);

function listImages(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => IMAGE_EXT.test(f)).sort();
}

function loadUserEntries() {
    const file = path.join(DATA_DIR, "users.json");
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

const uploadCache = new Map();
async function upload(kind, filename) {
    const key = `${kind}/${filename}`;
    if (uploadCache.has(key)) return uploadCache.get(key);

    const result = await cloudinary.uploader.upload(path.join(DATA_DIR, kind, filename), {
        folder: `strand/seed/${kind}`,
        public_id: path.parse(filename).name,
        overwrite: true, // re-running replaces the asset instead of piling up copies
        transformation:
            kind === "avatars"
                ? [{ width: 400, height: 400, crop: "fill", gravity: "auto" }]
                : [{ width: 1600, crop: "limit" }],
    });

    console.log(`  uploaded ${key}`);
    uploadCache.set(key, result.secure_url);
    return result.secure_url;
}

// ---------------- Fake text ----------------
const postGenerators = [
    () => faker.hacker.phrase(),
    () => `${faker.company.catchPhrase()}.`,
    () => faker.commerce.productDescription(),
    () => `Hot take: ${faker.company.buzzPhrase()}.`,
    () => `Thinking about ${faker.hacker.ingverb()} ${faker.hacker.noun()}.`,
    () => `Beautiful day in ${faker.location.city()}.`,
    () => `${faker.hacker.phrase()}\n\n${faker.company.catchPhrase()}.`,
];
const makePostText = () => pick(postGenerators)();

const reactions = [
    "Love this!",
    "Totally agree.",
    "Haha same.",
    "This is great.",
    "Interesting take.",
    "Not sure I agree, but fair point.",
    "Needed to hear this today.",
    "Okay this is actually really good.",
];
const makeComment = () => (chance(0.7) ? pick(reactions) : `${faker.company.buzzPhrase()}.`);

// ---------------- Main ----------------
async function main() {
    if (process.env.NODE_ENV === "production") {
        console.error("Refusing to seed fake data when NODE_ENV=production.");
        process.exit(1);
    }

    const avatarFiles = listImages(path.join(DATA_DIR, "avatars"));
    const postImageFiles = listImages(path.join(DATA_DIR, "posts"));

    if ((avatarFiles.length || postImageFiles.length) && !process.env.CLOUDINARY_CLOUD_NAME) {
        throw new Error("Images found in seed-data/ but CLOUDINARY_* env vars are missing.");
    }

    // ---- 1. Decide who the users are ----
    const entries = loadUserEntries();
    const total = Math.max(CONFIG.users, entries.length);
    const claimed = new Set(entries.map((e) => e.avatar).filter(Boolean));
    const freeAvatars = faker.helpers.shuffle(avatarFiles.filter((f) => !claimed.has(f)));
    const takenNames = new Set(entries.map((e) => e.username).filter(Boolean));

    const specs = [];
    for (let i = 0; i < total; i++) {
        const e = entries[i] || {};

        let username = e.username;
        if (!username) {
            do {
                username = faker.internet
                    .username()
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "_")
                    .slice(0, 20);
            } while (takenNames.has(username));
            takenNames.add(username);
        }

        let avatarFile = e.avatar !== undefined ? e.avatar : freeAvatars.shift() ?? null;
        if (avatarFile && !avatarFiles.includes(avatarFile)) {
            console.warn(`  ! avatar "${avatarFile}" for ${username} not found in avatars/, skipping`);
            avatarFile = null;
        }

        specs.push({ username, bio: e.bio ?? faker.person.bio(), avatarFile });
    }

    // ---- 2. Skip anyone who already exists ----
    const existing = await prisma.user.findMany({
        where: { username: { in: specs.map((s) => s.username) } },
        select: { username: true },
    });
    const existingNames = new Set(existing.map((u) => u.username));
    const newSpecs = specs.filter((s) => !existingNames.has(s.username));

    if (newSpecs.length === 0) {
        console.log("Seed users already exist, nothing to do.");
        return;
    }
    if (newSpecs.length < 2) {
        console.log("Need at least 2 new users to build follows/interactions, aborting.");
        return;
    }

    // ---- 3. Users ----
    console.log(`Creating ${newSpecs.length} users...`);
    const passwordHash = await bcrypt.hash(CONFIG.password, 10);
    const users = [];
    for (const spec of newSpecs) {
        const avatarUrl = spec.avatarFile ? await upload("avatars", spec.avatarFile) : null;
        const user = await prisma.user.create({
            data: {
                username: spec.username,
                bio: spec.bio,
                avatarUrl,
                passwordHash,
                authProvider: "LOCAL",
                isGuest: false,
                createdAt: between(daysAgo(CONFIG.daysBack), daysAgo(10)),
            },
        });
        users.push(user);
    }

    // ---- 4. Follows (some users end up much more followed than others) ----
    console.log("Creating follows...");
    const popularUsers = faker.helpers.shuffle(users);
    const userWeights = skewedWeights(popularUsers.length);
    const followMap = new Map();
    for (let tries = 0; followMap.size < CONFIG.follows && tries < CONFIG.follows * 20; tries++) {
        const follower = pick(users);
        const target = weightedPick(popularUsers, userWeights);
        if (follower.id === target.id) continue;

        const key = `${follower.id}:${target.id}`;
        if (followMap.has(key)) continue;

        followMap.set(key, {
            followerId: follower.id,
            followingId: target.id,
            status: chance(0.85) ? "ACCEPTED" : "PENDING",
            createdAt: between(later(follower.createdAt, target.createdAt), now()),
        });
    }
    const follows = [...followMap.values()];
    await prisma.follow.createMany({ data: follows });

    // ---- 5. Posts ----
    console.log(`Creating ${CONFIG.posts} posts...`);
    const posts = [];
    let imageCursor = 0;
    for (let i = 0; i < CONFIG.posts; i++) {
        const author = pick(users);
        const imageUrl =
            postImageFiles.length && chance(0.4)
                ? await upload("posts", postImageFiles[imageCursor++ % postImageFiles.length])
                : null;

        posts.push(
            await prisma.post.create({
                data: {
                    content: makePostText(),
                    imageUrl,
                    authorId: author.id,
                    createdAt: between(author.createdAt, now()),
                },
            })
        );
    }

    // A few posts get most of the engagement
    const rankedPosts = faker.helpers.shuffle(posts);
    const postWeights = skewedWeights(rankedPosts.length);
    const userById = new Map(users.map((u) => [u.id, u]));

    // ---- 6. Comments ----
    console.log(`Creating ${CONFIG.comments} comments...`);
    const comments = [];
    for (let i = 0; i < CONFIG.comments; i++) {
        const post = weightedPick(rankedPosts, postWeights);
        const author = pick(users);
        const comment = await prisma.comment.create({
            data: {
                content: makeComment(),
                postId: post.id,
                authorId: author.id,
                createdAt: between(later(post.createdAt, author.createdAt), now()),
            },
        });
        comments.push({ ...comment, postAuthorId: post.authorId });
    }

    // ---- 7. Votes (one per user per post, no self-votes) ----
    console.log("Creating votes...");
    const voteMap = new Map();
    for (let tries = 0; voteMap.size < CONFIG.votes && tries < CONFIG.votes * 30; tries++) {
        const post = weightedPick(rankedPosts, postWeights);
        const voter = pick(users);
        if (voter.id === post.authorId) continue;

        const key = `${voter.id}:${post.id}`;
        if (voteMap.has(key)) continue;

        voteMap.set(key, {
            userId: voter.id,
            postId: post.id,
            authorId: post.authorId, // used for notifications below, not stored on Vote
            type: chance(0.85) ? "LIKE" : "DISLIKE",
            createdAt: between(later(post.createdAt, userById.get(voter.id).createdAt), now()),
        });
    }
    const votes = [...voteMap.values()];
    await prisma.vote.createMany({
        data: votes.map(({ authorId, ...vote }) => vote),
    });

    // ---- 8. Notifications, mirroring what the real app would have generated ----
    console.log("Creating notifications...");
    const read = () => chance(0.6);
    const notifications = [];

    for (const v of votes) {
        if (v.type !== "LIKE") continue; // the app doesn't notify on dislikes
        notifications.push({
            type: "LIKE",
            recipientId: v.authorId,
            actorId: v.userId,
            postId: v.postId,
            createdAt: v.createdAt,
            read: read(),
        });
    }
    for (const c of comments) {
        if (c.authorId === c.postAuthorId) continue;
        notifications.push({
            type: "COMMENT",
            recipientId: c.postAuthorId,
            actorId: c.authorId,
            postId: c.postId,
            commentId: c.id,
            createdAt: c.createdAt,
            read: read(),
        });
    }
    for (const f of follows) {
        notifications.push({
            type: "FOLLOW_REQUEST",
            recipientId: f.followingId,
            actorId: f.followerId,
            createdAt: f.createdAt,
            read: read(),
        });
        if (f.status === "ACCEPTED") {
            notifications.push({
                type: "FOLLOW_ACCEPTED",
                recipientId: f.followerId,
                actorId: f.followingId,
                createdAt: between(f.createdAt, now()),
                read: read(),
            });
        }
    }
    await prisma.notification.createMany({ data: notifications });

    // ---- Summary ----
    console.log("\nDone.");
    console.log(
        `  ${users.length} users, ${posts.length} posts, ${comments.length} comments, ` +
        `${votes.length} votes, ${follows.length} follows, ${notifications.length} notifications`
    );
    console.log(`\nLog in as any seeded user with password "${CONFIG.password}", e.g.:`);
    console.log("  " + users.slice(0, 5).map((u) => u.username).join(", "));
}

main()
    .catch((err) => {
        console.error(err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());