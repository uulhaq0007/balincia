# Balincia — Maison de Parfum

A full-stack perfume e-commerce store built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4** and **Prisma** (SQLite by default). It's inspired by the feature set of a typical Pakistani fragrance retailer: collections, gift boxes, discovery sets, attars, home fragrance, a scent quiz, loyalty points, order tracking and returns. The design and brand are original.

## Quick start

```bash
npm install          # installs deps and generates the Prisma client
npm run setup        # creates prisma/dev.db and seeds demo data
npm run dev          # http://localhost:3000
```

| Demo account | Email | Password |
|---|---|---|
| Admin (→ `/admin`) | `admin@balincia.pk` | `Admin@12345` |
| Customer (340 loyalty points) | `ayesha@example.com` | `Customer@123` |

Demo discount codes: `WELCOME10` (10% off over Rs. 2,000), `FLAT500` (Rs. 500 off over Rs. 5,000), `FREESHIP`, and `EID25` (expired, to show the error state).

`npm run db:reset` wipes the database and re-seeds it.

## Features

### Storefront
- **Home**: editorial hero, notes marquee, shop-by-world tiles, best sellers / gift sets / new arrivals / under Rs. 2,000 rails, Noir feature banner, scent-family explorer, quiz CTA, trust section with live stats, real customer reviews, journal teaser and boutiques.
- **Catalogue** (`/shop`, `/collections/[slug]`): category and virtual collections (best sellers, new arrivals, under 2000, oud, sale, men, women, unisex). Filters for gender, scent family, season, genre, occasion, price, longevity and sale; six sort orders; pagination. All state lives in the URL, so filtered pages are shareable.
- **Live search overlay** with suggestions; full search results at `/shop?q=`.
- **Product page**: gallery, size variants with stock awareness ("Only 3 left"), add to bag, buy now, wishlist, fragrance pyramid, longevity and sillage meters, seasons and occasions, reviews with rating distribution and a review form, related products, and Product JSON-LD for SEO.
- **Generative bottle art**: every product renders a unique SVG bottle (8 shapes) from its colour palette, so the store looks complete before any photography. Uploaded photos replace it automatically.
- **Bag**: slide-out drawer and full page, quantity limits by stock, free-shipping progress meter.
- **Checkout**: guest or member, saved addresses, Pakistani cities and provinces, Standard / Express delivery, Cash on Delivery / Bank Transfer / JazzCash–Easypaisa, gift wrap with a message, discount codes, and loyalty points redemption. Totals are recalculated and validated on the server, and stock is decremented inside a transaction.
- **Order confirmation** (private to the buyer), **order tracking** by number plus email or phone, **15-day return requests** with eligibility checks.
- **Account**: loyalty tier and progress (Silver → Gold → Noir), order history and timelines, address book, profile and password.
- **Scent quiz**: five questions, server-side scoring and a scent persona.
- **Content**: journal (blog), store locator, about, FAQ, shipping / returns / privacy / terms policies, contact form (general, corporate/bulk, "request a perfume"), newsletter, WhatsApp button, sitemap and robots.

### Admin (`/admin`, admin role only)
Dashboard (revenue, KPIs, 14-day chart, top products, low stock), orders (filter, search, status workflow, courier and tracking, timeline, printable invoice), products (full editor with variants, images and upload, scent profile, live bottle-art preview), categories, customers (spend, points adjustment, roles), coupons, review moderation, inbox (messages, return requests, subscriber CSV export), journal and store settings (announcement bar, shipping fees and threshold, loyalty rates, payment details).

Order rules are enforced centrally in `src/lib/orders.ts`. Cancelling restores stock and refunds redeemed points. Marking an order delivered awards loyalty points and marks COD orders as paid.

## Architecture

```
prisma/
  schema.prisma        data model (users, products, variants, orders, coupons, reviews, posts, settings…)
  seed.ts              40 products, reviews, demo orders, coupons, journal posts
src/
  app/(store)/         storefront routes (share the header/footer layout)
  app/admin/           admin panel (server components + server actions)
  app/api/             REST endpoints: auth, checkout, coupons, search, products, reviews, track, returns, contact, newsletter, admin upload/export
  components/          UI by area: layout, product, catalog, cart, checkout, order, account, home, forms, admin
  lib/                 db, auth (JWT cookie sessions), catalog queries, pricing, orders, settings, validators (zod), constants
  store/               client state (zustand): cart, wishlist, UI
  middleware.ts        protects /account and /admin
```

- **Auth**: email and password (bcrypt) with a signed JWT in an httpOnly cookie (`jose`). Middleware gates `/account/*` and `/admin/*`, and every admin page and action re-checks the role.
- **Pricing**: `src/lib/pricing.ts` is shared by the checkout UI (estimates) and the order API (authoritative totals).
- **Cart and wishlist** persist in `localStorage`; the server re-validates every line at checkout.

## Going to production

1. **Database**: switch `provider` in `prisma/schema.prisma` to `postgresql` and set `DATABASE_URL` (Neon, Supabase, RDS…). The schema stores enum-like fields as strings, so no other changes are needed. Then run `npx prisma db push` and optionally `npm run db:seed`.
2. **Secrets**: set a long random `AUTH_SECRET` and your public `NEXT_PUBLIC_SITE_URL`.
3. **Image uploads** are saved to `storage/uploads` and served by `/media/[file]`, which works with `next start` on a VPS or Docker (persist that folder as a volume). On serverless hosts (e.g. Vercel) the filesystem is ephemeral, so point `src/app/api/admin/upload/route.ts` at S3, Cloudinary or Vercel Blob instead, or paste image URLs in the product editor.
4. **Integrations not included** (they need merchant accounts or API keys): online card payments (e.g. PayFast, Safepay, Stripe), transactional email/SMS/WhatsApp notifications, and courier booking APIs. Clear extension points exist: payment methods in `src/lib/constants.ts`, order creation in `src/lib/orders.ts` and status changes in `updateOrderStatus`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | TypeScript check |
| `npm run setup` | Create the DB schema and seed |
| `npm run db:reset` | Drop, recreate and seed the DB |
