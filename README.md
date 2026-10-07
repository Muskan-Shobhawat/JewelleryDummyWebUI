# Kanak Jewellers – Demo Website (Next.js)

Responsive, mobile-first storefront for the Kanak Jewellers demo. Talks to the backend in `JewelleryDummyBackend`.

## Run

```bash
# 1. start the API (in JewelleryDummyBackend)
npm run dev            # http://localhost:4000

# 2. start this site
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev            # http://localhost:3000
```

Demo login: mobile `9999999999`, OTP `123456` (any other number creates a fresh customer).

## Stack

- Next.js 16 (App Router, JavaScript), React 19
- Tailwind CSS v4. Theme tokens (purple `#4A1942`, cream `#F7EFEA`, accent gold) live in `src/app/globals.css` and are overridden at runtime from `GET /api/config`, so a rebrand needs no code change.
- SWR for data fetching, lucide-react icons, Playfair Display + DM Sans via `next/font`.

## Structure

```
src/app/                 routes (all client components)
  page.js                home: hero carousel, live rate ticker, categories, scheme tiles, product rails
  jewellery/             listing with filters + product detail (price breakup, WhatsApp order, express interest)
  digi-gold, ema, book-my-gold, advance-gold, gift-cards
  cart, checkout, orders/[id], track-order
  wallet, transactions, wishlist, interests, notifications, profile, login
  contact, about, faq, search, pages/[slug]
src/components/          layout (header, footer, bottom nav, login sheet), ui (modal, mock checkout, bits), home, product, schemes
src/context/             config/theme, auth, cart, toast, payment (mock gateway)
src/lib/                 api client (SWR), formatters
```

## Key flows

- **Payments**: any purchase returns a checkout payload; `PaymentContext.openCheckout()` shows a mock gateway (UPI, card, net banking, "simulate failure"), confirms with the API and runs the success callback.
- **Login**: `useAuth().requireLogin(cb)` opens the OTP sheet anywhere and runs `cb` after login.
- **Live rates**: `RateTicker` subscribes to `/rates/stream` (SSE) with a 30s polling fallback.
- **Mobile**: sticky header, bottom navigation (Home, Jewellery, Wallet, My Txn, Contact), bottom-sheet modals, horizontal rails.
