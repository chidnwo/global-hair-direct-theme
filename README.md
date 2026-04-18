# Global Hair Direct Nigeria — Shopify Liquid Theme

## Installation Guide

### Step 1 — Upload to Shopify
1. Go to your Shopify Admin → Online Store → Themes
2. Click "Add theme" → "Upload zip file"
3. Upload the `global-hair-direct-theme.zip` file
4. Click "Publish" once uploaded

### Step 2 — Set Up Navigation Menus
Go to Online Store → Navigation and create:
- **main-menu** with links: Home, Shop, Pre-Order, Wholesale, How It Works, FAQ
- **footer-products** with links to your product collections
- **footer-accounts** with links: Wholesale, Pre-Order, Salon Registration
- **footer-support** with links: Contact, Track Order, Returns, Terms

### Step 3 — Add Your Products
Go to Products → Add product for each:

**Product 1: Bone Straight Braiding Hair 30inch**
- Title: Bone Straight Braiding Hair 30inch
- Type: Braiding Hair
- Vendor: Global Hair Direct
- Price: $1.00 (or ₦1,500 equivalent)
- Variants: Add option "Colour" with values: 1B, 27#, BUG, 613#
- Tag: in-stock

**Product 2: French Curl Hair 22inch**
- Title: French Curl Hair 22inch
- Type: Curl Hair
- Vendor: Global Hair Direct
- Price: $1.00
- Variants: Colour — 1B, 27#, BUG, 613#
- Tag: in-stock

**Product 3: Deep Wave Bulk 22inch**
- Title: Deep Wave Bulk 22inch
- Type: Bulk Hair
- Vendor: Global Hair Direct
- Price: $2.00
- Variants: Colour — 1B, 27#, BUG, 613#
- Tag: in-stock

### Step 4 — Create a Collection
Go to Collections → Create collection:
- Title: All Hair Products
- Add all 3 products to this collection
- Use handle: `all` or `hair-products`

### Step 5 — Customise the Theme
Go to Online Store → Themes → Customise:
- **Announcement Bar**: Add your ticker items
- **Hero section**: Update title, lead text, stats panel
- **Featured Products**: Select your collection
- **FAQ**: Edit questions and answers
- **Footer**: Update brand description and email

### Step 6 — Connect Your Domain
Go to Online Store → Domains:
- Click "Connect existing domain"
- Enter: globalhairdirect.com.ng
- Follow the DNS instructions (point to Shopify)
- Update your Whogohost DNS settings accordingly

### Step 7 — Install Paystack
Go to Apps → Shopify App Store → Search "Paystack"
- Install the official Paystack plugin
- Enter your Paystack API keys
- Enable NGN (Nigerian Naira) as currency

### Step 8 — Set Currency to NGN
Go to Settings → Store details → Store currency
- Change to Nigerian Naira (NGN ₦)

---

## Theme Files Overview

```
global-hair-direct-theme/
├── assets/
│   ├── theme.css          — All styles
│   └── theme.js           — FAQ, filters, cart interactions
├── config/
│   └── settings_data.json — Default theme settings
├── layout/
│   └── theme.liquid       — Main HTML wrapper
├── locales/
│   └── en.default.json    — English translations
├── sections/
│   ├── header.liquid           — Sticky navigation
│   ├── announcement-bar.liquid — Ticker strip
│   ├── hero.liquid             — Homepage hero
│   ├── featured-products.liquid — Product grid
│   ├── faq.liquid              — Accordion FAQ
│   ├── cta-banner.liquid       — Bottom CTA
│   └── footer.liquid           — Site footer
└── templates/
    ├── index.liquid       — Homepage
    ├── product.liquid     — Product detail page
    ├── collection.liquid  — Collection/shop page
    └── cart.liquid        — Shopping cart
```

## Support
For customisation help, contact a Shopify Liquid developer on Fiverr or Upwork.
Search: "Shopify Liquid theme customisation Nigeria"
