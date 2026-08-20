# Branding & Concept

App name: Strand
Logo: a worm (recurring "worm" motif/theme throughout the app)
Tagline: "The minimalist micro network. Connect the dots. Share the strand."
Positioning: hybrid of Threads/Instagram/Reddit
UI concept: Instagram-style top nav/feed area, masonry layout below

## Core Features

## Authentication

User must be signed in to use the app (guest or authenticated)
Passport Local strategy (username/password)
Passport GitHub strategy (OAuth)
Guest sign-in (bypass login, no credentials required)

## Home Page

Feed showing recent posts + posts from followed users
Left sidebar with navigation options
Right sidebar showing newest users and most-followed users

## User Profiles

Create profile with profile picture (GitHub avatar or Gravatar fallback)
Send/accept follow requests
Index page listing all users with follow/pending/following button states

## Posts

Create text posts
Two feed types: recent posts / posts from followed users
Reddit-style like/dislike (upvote/downvote) button
Each post displays: author avatar, date, content, comment count, like count
Comment section on each post

## Comments

Add new comments on a post
View existing comments on a post
Nice-to-Have Features
Image support on posts (via URL or upload — Cloudinary/Supabase storage)
Allow users to update their profile photo after signup
Real-time chat between users
Real-time notifications (likes, comments, follows)
Loading/skeleton states while scrolling/fetching more posts
Faker.js for seeding demo data
Polished visual design ("make it pretty" — worm/thread motif, custom theming)
