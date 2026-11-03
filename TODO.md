# Strand — Todo List

## 4. TODO

- Fix the dashboard page dummy content
- make users profiles clickable meaning clicking on avatar takes to profile
- move latest users, most followed users from right side of page to small avatar icons on top of dashboard kind of like instagram

## 2. CLEANUPS

- Add Validation using express validator
-add a password see button on input login
-change signup page tagline
-add a random image generator button on profile
- make users profile clickable on posts
- notification number doesnt update once we view a notification
- add option to view followers and following on profile view page
- update home out of dummy data
- add strands github profile pic
- mark all as read feature not working

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


Unfinished from your original requirements
Home right rail is still dummy data. “Latest users” and “Most followed” use hardcoded arrays, and their Follow buttons do nothing. This needs two small endpoints plus wiring UserListWidget to the real follow/unfollow calls.
The Follow button on Profile.jsx isn’t wired. It renders but has no handler.
Faker seed script. Not built yet, and it would make polishing much easier since you’d have realistic data to look at.
Profile photo upload from PC. Right now you can only paste an avatar URL. The Cloudinary flow from CreatePost can be reused.
Gravatar fallback. Local-signup users have no avatar (the original spec mentioned this).
Real-time notifications. The bell badge fetches once on mount. Your socket already exists, so this is a small addition.
Deployment.
Gaps I noticed
No way to delete (or edit) a post.
No unread badge on the sidebar’s Message icon.
Account deletion is still undecided from the Settings discussion.
Guest accounts pile up in the DB, so you’d want a cleanup job.
Follower/following counts on profiles aren’t clickable (no lists).
No 404 page or error boundary.
Production hardening, needed before deploying
Sessions use the in-memory store, so everyone is logged out on every server restart. It should move to a Postgres-backed store.
Cookie flags (secure, sameSite) need setting for cross-domain hosting.
Add rate limiting on auth routes and password rules on signup.

If I had to rank them for a portfolio project, I’d do the right rail, the Profile Follow button, the Faker seed and post deletion first, since those are visible gaps a reviewer