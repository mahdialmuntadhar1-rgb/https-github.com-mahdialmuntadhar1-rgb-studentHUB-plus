# Rafid Platform - Verification Checklist

This checklist covers all features implemented for the production-ready Rafid platform.

## Database Setup

### Backend Schema
- [ ] Run `cd backend && npm run db:init` to initialize local D1 database
- [ ] Run `cd backend && npm run db:init:remote` to initialize remote D1 database
- [ ] Verify tables created: profiles, posts, post_likes, opportunities, comments, chat_rooms, messages, logs, password_resets, user_permissions
- [ ] Run `cd backend && npm run db:seed` to seed local database with test data
- [ ] Run `cd backend && npm run db:seed:remote` to seed remote database

### Seed Data Verification
- [ ] Verify 12 profiles created in database
- [ ] Verify 120 posts created (mix of Arabic and English)
- [ ] Verify 25 opportunities created
- [ ] Check posts have correct metadata with language field

## Backend API Testing

### Authentication
- [ ] Test POST `/api/register` with valid user data
- [ ] Test POST `/api/login` returns JWT token
- [ ] Verify token stored in localStorage as `rafid_token`
- [ ] Test GET `/api/me` returns user profile with valid token
- [ ] Test unauthorized access returns 401

### Posts API
- [ ] Test GET `/api/posts?page=1&limit=10` returns paginated response
- [ ] Verify response contains `posts` array and `pagination` object
- [ ] Verify pagination includes: page, limit, total, totalPages, hasMore
- [ ] Test filter by governorate: `/api/posts?governorate=بغداد`
- [ ] Test filter by institution: `/api/posts?institution=جامعة بغداد`
- [ ] Test POST `/api/posts` creates new post with auth
- [ ] Test POST `/api/posts/like` toggles like status
- [ ] Verify pagination works correctly (offset calculation)

### Opportunities API
- [ ] Test GET `/api/opportunities` returns all opportunities
- [ ] Test filter by type: `/api/opportunities?type=job`
- [ ] Test filter by institution: `/api/opportunities?institution=جامعة بغداد`
- [ ] Test filter by city: `/api/opportunities?city=بغداد`
- [ ] Verify AND logic works for multiple filters

### Chat API
- [ ] Test GET `/api/chat/rooms` returns user's chat rooms
- [ ] Test POST `/api/chat/rooms` creates new chat room
- [ ] Test GET `/api/chat/rooms/:roomId/messages` returns messages
- [ ] Test POST `/api/chat/rooms/:roomId/messages` sends message
- [ ] Verify messages include sender info (name, avatar)

## Frontend Testing

### Authentication Flow
- [ ] Register new user successfully
- [ ] Login with valid credentials
- [ ] Redirect to home/feed after login
- [ ] Logout clears localStorage and redirects
- [ ] Protected routes redirect to auth when not logged in

### Feed Page
- [ ] Feed loads posts from API
- [ ] Pagination "Load More" button works
- [ ] Filter by governorate updates feed
- [ ] Filter by institution updates feed
- [ ] Post cards display correctly
- [ ] Like button updates count
- [ ] Comment button opens comment section
- [ ] Share button works (native share or clipboard)

### Chat Feature
- [ ] Floating chat button visible on authenticated pages
- [ ] Clicking button opens chat window
- [ ] Chat rooms list displays
- [ ] Clicking room opens message view
- [ ] Sending message adds to list
- [ ] Messages poll every 3 seconds
- [ ] RTL/LTR direction correct for message content
- [ ] Minimize/maximize toggle works
- [ ] Close button hides chat window

### Opportunities Hub
- [ ] Page loads with all opportunities
- [ ] Category tiles filter by type
- [ ] Tab navigation (All, Insights, Saved) works
- [ ] University filter dropdown works
- [ ] City filter dropdown works
- [ ] Active filters display count
- [ ] Clear filters button removes all filters
- [ ] AND logic works (university + city together)

### Bilingual Support
- [ ] Language toggle button in header works
- [ ] Arabic (ع) / English (EN) indicator updates
- [ ] Navbar labels change based on language
- [ ] Document dir attribute changes (rtl/ltr)
- [ ] Post content direction auto-detects (Arabic = RTL, English = LTR)
- [ ] Language preference saved to localStorage
- [ ] Language persists across page reloads

### Dark/Light Mode
- [ ] Theme toggle button in header works
- [ ] Moon/Sun icon changes based on theme
- [ ] Dark mode applies to all components
- [ ] Background colors change correctly
- [ ] Text colors change correctly
- [ ] Border colors change correctly
- [ ] Theme preference saved to localStorage
- [ ] Theme persists across page reloads
- [ ] Respects system preference on first visit

### UI/UX
- [ ] Glassmorphism effects visible (backdrop-blur)
- [ ] Animations smooth (motion/framer-motion)
- [ ] Transitions on hover states
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] Responsive design on desktop
- [ ] Sticky navigation works
- [ ] Scroll behavior smooth
- [ ] Loading states display (skeletons)
- [ ] Error states display gracefully

## Integration Testing

### End-to-End Workflows
- [ ] User registers → logs in → creates post → appears in feed
- [ ] User filters feed by governorate → results update
- [ ] User filters opportunities by university + city → results update
- [ ] User switches language → UI updates → persists
- [ ] User toggles dark mode → UI updates → persists
- [ ] User starts chat → sends message → receives message (simulate second user)

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms for paginated queries
- [ ] Chat polling doesn't cause performance issues
- [ ] Animations run at 60fps
- [ ] No memory leaks on navigation

## Deployment Checklist

### Backend (Cloudflare Workers)
- [ ] Update `wrangler.toml` with correct account ID
- [ ] Set environment variables in Cloudflare dashboard:
  - `JWT_SECRET`
  - `R2_PUBLIC_URL` (if using R2)
- [ ] Run `cd backend && npm run deploy`
- [ ] Verify worker deployed successfully
- [ ] Test remote API endpoints
- [ ] Run `npm run db:init:remote` on production
- [ ] Run `npm run db:seed:remote` on production

### Frontend (Vite)
- [ ] Set `VITE_API_URL` in `.env` to production backend URL
- [ ] Run `npm run build`
- [ ] Verify build completes without errors
- [ ] Deploy to hosting platform (Cloudflare Pages, Vercel, etc.)
- [ ] Test production build in browser
- [ ] Verify all API calls work with production backend

## Browser Compatibility
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Test on mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Alt text on images

## Security
- [ ] JWT tokens stored securely
- [ ] API endpoints protected with auth middleware
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React escaping)
- [ ] CORS configured correctly
- [ ] Environment variables not exposed in client code

## Known Limitations
- Chat uses polling (3-second interval) instead of WebSockets
- Real-time chat requires Durable Objects for true WebSocket support
- Image upload requires R2 bucket configuration
- No push notifications implemented
- No email verification for registration

## Test Commands

```bash
# Backend
cd backend
npm run dev              # Start local dev server
npm run deploy           # Deploy to Cloudflare Workers
npm run db:init          # Initialize local D1 database
npm run db:init:remote   # Initialize remote D1 database
npm run db:seed          # Seed local database
npm run db:seed:remote   # Seed remote database

# Frontend
npm run dev              # Start local dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## Success Criteria
- All items in this checklist verified
- No console errors in browser
- All API endpoints return correct responses
- Database seeded with required data
- Bilingual switching works seamlessly
- Dark/light mode works seamlessly
- Chat functional (with polling)
- Pagination works correctly
- Filters work correctly
- Responsive on all screen sizes
