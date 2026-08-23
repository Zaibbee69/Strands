# Strand — Todo List

## 2. Authentication

- Add Validation using express validator
- Add my logo to github login
- [ ] Basic sign-in / sign-up pages (UI)

## 3. User & Profile

- [ ] User model (username, email, password hash, avatar, bio)
- [ ] Profile page (view own/other profiles)
- [ ] Avatar handling: GitHub avatar → fallback to Gravatar
- [ ] Update profile photo functionality
- [ ] Follow/unfollow logic (follow requests, pending state)
- [ ] Users index page (list all users + follow/pending/following button states)

## 4. Posts

- [ ] Post model (author, content, image URL, timestamp, likes/dislikes)
- [ ] Create post (text only first)
- [ ] Add image support to posts (URL input first, then upload via Cloudinary/Supabase)
- [ ] Like/dislike (upvote/downvote) logic + button UI
- [ ] Feed query: recent posts
- [ ] Feed query: posts from followed users
- [ ] Post card UI (avatar, date, content, like count, comment count)

## 5. Comments

- [ ] Comment model (post ref, author, content, timestamp)
- [ ] Add comment functionality
- [ ] Display comments under each post
- [ ] Comment count on post card

## 6. Home Page Layout

- [ ] Left sidebar navigation
- [ ] Right sidebar: newest users + most-followed users
- [ ] Main feed area (toggle: recent / following)
- [ ] Masonry layout for feed/grid section
- [ ] Instagram-style top bar/nav

## 7. Seeding & Data

- [ ] Set up Faker.js
- [ ] Seed script: fake users, posts, comments, follows, likes

## 8. Polish & UX

- [ ] Loading/skeleton states for infinite scroll
- [ ] Infinite scroll or pagination on feed
- [ ] Show users which are online
- [ ] Empty states (no posts, no followers, etc.)
- [ ] Responsive design pass
- [ ] Worm-themed branding: logo, favicon, loading animation, color palette
- [ ] Error handling / 404 pages

## 9. Stretch Goals (Nice-to-Have)

- [ ] Real-time notifications (likes, comments, follows) — Socket.io or similar
- [ ] Real-time chat between users
- [ ] Notification bell/dropdown UI
- [ ] Deploy (Render/Railway/Vercel + DB host)
