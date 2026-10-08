# Kaytlyn Leonor — Luxury Fashion E-Commerce

A fully functional luxury fashion e-commerce web app built with React, TypeScript, and Tailwind CSS. Inspired by high-end fashion maisons, it features a complete shopping experience from browsing to checkout.

---

## ✨ Features

- **Hero & Campaign sections** — cinematic full-screen visuals with editorial copy
- **Shop with filters** — category tabs, collection filter, price range slider, in-stock toggle, and sort options
- **Product detail modal** — image gallery, variant/size selector, add to bag
- **Mini cart drawer** — live quantity updates, subtotal, free shipping progress bar
- **Checkout modal** — address form, COD & Razorpay payment options, order confirmation with confetti
- **Wishlist** — save and manage favourite products
- **Account drawer** — login/signup UI, order history
- **Search overlay** — live product search
- **Journal** — editorial articles with modal reader
- **CMS Admin modal** — edit announcement bar, hero copy, and homepage content
- **Cookie consent banner**
- **Responsive** — mobile-first design with bottom navigation bar on mobile
- **Multi-currency** — INR, USD, EUR, GBP support

---

## 🛠 Tech Stack

| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Vite 8 | Dev server & build tool |
| Framer Motion | Animations |
| Lucide React | Icons |
| Canvas Confetti | Order success animation |
| Razorpay | Payment gateway |
| Git LFS | Large media file storage |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root with:

```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_here
```

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

---

## 📁 Project Structure

```
demodot/
├── public/
│   ├── assets/images/        # Hero & category images
│   ├── main-video.mp4        # Homepage fashion video
│   └── *.png / *.jpeg        # Campaign & editorial images
├── src/
│   ├── components/
│   │   ├── account/          # Login, signup, account drawer
│   │   ├── cart/             # Mini cart drawer
│   │   ├── checkout/         # Checkout modal & payment
│   │   ├── cms/              # CMS admin panel
│   │   ├── common/           # Toast, 404, loading, contact, policy
│   │   ├── home/             # Hero, featured, bestsellers, newsletter, etc.
│   │   ├── journal/          # Articles & journal view
│   │   ├── layout/           # Navbar, footer, announcement bar, mobile bar
│   │   ├── product/          # Product card, grid, detail modal
│   │   ├── search/           # Search overlay
│   │   ├── shop/             # Shop view, filter drawer
│   │   └── wishlist/         # Wishlist view
│   ├── context/
│   │   └── StoreContext.tsx  # Global state (cart, wishlist, products, orders)
│   ├── data/
│   │   ├── products.ts       # Product catalogue
│   │   ├── collections.ts    # Collections data
│   │   └── initialCMS.ts     # Default CMS content
│   └── types/
│       └── ecommerce.ts      # TypeScript types
├── .env                      # Environment variables (not committed)
├── .gitattributes            # Git LFS tracking rules
└── .gitignore
```

---

## 💳 Payment

Uses **Razorpay** in test mode. Use these test card details:

| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |

For COD — just select "Cash on Delivery" at checkout.

---

## 📝 Notes

- Product data is stored in `localStorage` for persistence across page refreshes
- All prices are in INR (₹3,000 – ₹10,000 range)
- Images and videos are stored in Git LFS due to file size
