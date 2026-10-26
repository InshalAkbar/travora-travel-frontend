# Travora — static frontend (no PHP / MySQL / Laravel)

Open `index.html`, or upload this whole folder to any static host (Netlify, GitHub Pages, cPanel, Vercel...).
Bootstrap, Font Awesome, Google Fonts and the Unsplash photos load from CDNs, so an internet connection is needed.

## Pages
- Public: `index`, `explore`, `guides`, `planner`, `favorites`, `ai-assistant`, `login`, `register`
- Categories: `category-beaches/mountains/cities/deserts/forests/islands.html`
- 16 destinations: `destination-N.html` and `booking-N.html`; `booking-success.html`; `profile.html`
- Admin: `admin/login.html`, `admin/dashboard.html`, `admin/users.html`, `admin/bookings.html`, `admin/ai-chats.html`
- `js/travora-static.js` replaces the backend; `js/travora-data.js` holds the destinations and demo users/bookings.

## Demo logins (kept in localStorage)
| Role | Email | Password |
|------|-------|----------|
| User | user@travora.com | user123 |
| Admin | admin@travora.com | admin123 |

Registration works (new accounts are stored in the browser only).

## What works
Favorites (heart buttons, favorites page, nav counter), login / register / logout with the same access rules (profile and booking need login, admin pages need admin),
booking flow -> booking-success -> shows in Profile, AI Trip Planner (local generator, same logic as the Laravel fallback), AI Concierge chat (same rule-based replies),
admin booking status changes. Nothing is sent to a server; admin lists show demo data.
