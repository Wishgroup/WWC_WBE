# Wish Waves Club Website Documentation

## Overview
The Wish Waves Club website is a single-page application (SPA) built with React and Vite. It showcases membership benefits, pricing tiers, features, and testimonials for an exclusive membership club. The website uses smooth scrolling navigation with anchor links to different sections.

---

## Website Structure

### Architecture
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Type**: Single-Page Application (SPA)
- **Navigation**: Anchor-based smooth scrolling (no React Router)

---

## Complete Website Sitemap

### Entry Flow
The website entry flow follows this path:
1. **WWW.WISHWAVESCLUB.COM** (Main Domain)
2. **PRELOADER** (Loading screen)
3. **REGISTRATION FORM** (New user registration)
4. **PAYMENT GATEWAY** (Payment processing)
5. **LANDING PAGE** (Main entry point)

**Alternative Path**: Direct access to **LANDING PAGE** (for returning users or direct navigation)

### Global Elements
- **HEADER**: Global header component (appears on all pages)
- **FOOTER**: Global footer component (appears on all pages)
- **PRIVACY POLICY**: Standalone page/section

### Main Navigation Sections
From the **LANDING PAGE**, the website branches into the following main sections:

#### 1. HOME
- **INTRO. VIDEO**: Introduction video section/page
- **UPCOMING EVENTS**: Events listing page
  - **EVENT UPDATER**: External/internal system that feeds event data to "Upcoming Events"
  - **INDIVIDUAL PAGES WITH EVENT HOOK**: Individual event detail pages linked from "Upcoming Events"

#### 2. ABOUT MEMBERSHIP
- **HOW WE USE**: Information about how membership works
- **BENIFITS**: Membership benefits page
  - **MEMBER AS A VENDOR**: Sub-section/page about vendor membership benefits (linked from Benefits)

#### 3. MEMBERSHIP REGISTRATION
- **MEMBERSHIP APPLICATION**: Membership registration form/page

#### 4. VENDORS
- Vendor-related pages and information

#### 5. OFFERS & BENIFITS
- Offers and benefits showcase page

#### 6. SUPPORT
- Support and help pages

#### 7. ABOUT US
- Company information and about page

#### 8. NEWSROOM
- **UPCOMING EVENTS**: News-related events listing (may be duplicate or separate from HOME events)
  - **EVENT PAGE WITH SOCIAL MEDIA HOOKS**: Individual event pages with social media integration (linked from Newsroom "Upcoming Events")

### Sitemap Hierarchy Summary

```
WWW.WISHWAVESCLUB.COM
│
├── PRELOADER
│
├── REGISTRATION FORM
│
├── PAYMENT GATEWAY
│
└── LANDING PAGE
    │
    ├── HOME
    │   ├── INTRO. VIDEO
    │   └── UPCOMING EVENTS
    │       ├── [EVENT UPDATER] → feeds data
    │       └── INDIVIDUAL PAGES WITH EVENT HOOK
    │
    ├── ABOUT MEMBERSHIP
    │   ├── HOW WE USE
    │   └── BENIFITS
    │       └── MEMBER AS A VENDOR
    │
    ├── MEMBERSHIP REGISTRATION
    │   └── MEMBERSHIP APPLICATION
    │
    ├── VENDORS
    │
    ├── OFFERS & BENIFITS
    │
    ├── SUPPORT
    │
    ├── ABOUT US
    │
    └── NEWSROOM
        └── UPCOMING EVENTS
            └── EVENT PAGE WITH SOCIAL MEDIA HOOKS

Global Elements:
├── HEADER (on all pages)
├── FOOTER (on all pages)
└── PRIVACY POLICY (standalone)
```

**Note**: The current implementation is a single-page application (SPA) with sections. The sitemap above represents the planned/desired structure. Some sections may need to be implemented as separate routes or pages in the future.

---

## Layout & Navigation

### Header Component
**Location**: Fixed at the top of the page

**Elements**:
- **Logo**: Wish Waves Club logo (links to homepage/scrolls to top)
- **Navigation Menu** (Desktop & Mobile):
  - Memberships (links to `#memberships`)
  - How it works (links to `#how-it-works`)
  - Why WWC (links to `#why-wwc`)
  - Benefits (links to `#benefits`)
  - Events (links to `#events`)
- **Action Buttons**:
  - "Join Now" (secondary button)
  - "Gift Membership" (primary button)
- **Mobile Menu Toggle**: Hamburger menu for mobile devices

**Behavior**:
- Responsive design with collapsible mobile menu
- Sticky/fixed positioning (stays visible while scrolling)

---

## Page Sections (Top to Bottom)

### 1. Hero Section
**Component**: `Hero.jsx`  
**ID**: None (top of page)

**Content**:
- **Background**: Full-screen background image (`Front Annual.png`)
- **Interactive Element**: LiquidEther 3D animation overlay
- **Main Message**: 
  - Headline: "There's still time to save 10%"
  - Subtitle: Information about exclusive membership benefits and 10% discount on annual memberships with free shipping
- **Call-to-Action**: "Join Now" button

**Visual Effects**:
- Fade-in animations
- Interactive liquid animation that responds to mouse movement
- Overlay for text readability

---

### 2. Memberships Section
**Component**: `Memberships.jsx`  
**ID**: `#memberships`  
**Navigation Link**: Header → "Memberships"

**Content**:
- **Section Title**: "Choose a membership"
- **Three Membership Tiers** (displayed in a grid):

  #### Essential Membership
  - **Price**: $129 (originally $199)
  - **Savings**: Save $70
  - **Features**:
    - Access to exclusive events
    - Member-only discounts (10-20% off)
    - Early access to new experiences
    - Community networking opportunities
    - Monthly newsletter with insider tips
  - **CTA**: "START WITH ESSENTIAL"

  #### Premium Membership (Highlighted)
  - **Price**: $216 (originally $239)
  - **Savings**: Save 10%
  - **Badge**: "Free trial available"
  - **Features**:
    - Everything in Essential, plus:
    - VIP event access & priority seating
    - Exclusive member-only experiences
    - Personal concierge support
    - Quarterly member appreciation events
    - Advanced booking privileges
  - **CTA**: "START WITH PREMIUM"

  #### Elite Membership
  - **Price**: $324 (originally $359)
  - **Savings**: Save 10%
  - **Features**:
    - Everything in Premium, plus:
    - Unlimited event access
    - Private member gatherings
    - Dedicated membership manager
    - Exclusive travel & lifestyle benefits
    - Annual member retreat invitation
    - Lifetime membership perks
  - **CTA**: "START WITH ELITE"

- **Gift Section**: 
  - Title: "One gift, better experiences"
  - Description about gifting memberships and benefits
  - "Explore Gifts" button

**Visual Effects**:
- Scroll-triggered animations
- Hover effects on membership cards
- Highlighted Premium membership card

---

### 3. Features/Benefits Section
**Component**: `Features.jsx`  
**ID**: `#benefits`  
**Navigation Link**: Header → "Benefits"

**Content**:
- **Section Header**:
  - Title: "Get a complete picture of your membership"
  - Subtitle: Description of comprehensive membership benefits

- **Six Feature Cards** (grid layout):
  1. **Exclusive Event Access** 🎫
     - Priority access to curated events, workshops, and experiences
  2. **Member Discounts** 💰
     - Significant savings on events, products, and services
  3. **Community Network** 🤝
     - Connect with like-minded individuals
  4. **Early Access** ⭐
     - First to know about new experiences and events
  5. **Personalized Experiences** 🎯
     - Tailored recommendations based on interests
  6. **VIP Treatment** 👑
     - Premium perks including priority seating and dedicated support

- **Four Showcase Items** (alternating left/right layout):
  1. **Quantify your membership value**
     - Track savings, events attended, and experiences
     - Membership Dashboard visualization
  2. **Extend your network and experiences**
     - Community networking features
     - Community Network visualization
  3. **Optimize your event calendar**
     - Personalized event recommendations
     - Event Calendar visualization
  4. **Measure the impact of every experience**
     - Track journey and growth
     - Experience Tracker visualization

**Visual Effects**:
- Scroll-triggered animations
- Staggered animations for cards
- Hover effects
- Alternating left/right layout for showcase items

---

### 4. Testimonials Section
**Component**: `Testimonials.jsx`  
**ID**: None (no anchor link in header)

**Content**:
- **Masonry/Grid Layout** with mixed card types:

  #### Ambassador Cards (with images):
  1. **Alexandra Chen** - Lifestyle Influencer (Large card, Play button)
  2. **Marcus Johnson** - Tech Entrepreneur (Normal, Play button)
  3. **Sophie Williams** - Wellness Advocate (Normal, Plus button)
  4. **Aryna Sabalenka** - World No. 1 Tennis Player (Normal, Plus button)
  5. **Lucy Charles-Barclay** - Champion Triathlete (Normal, Plus button)
  6. **Rory McIlroy** - Grand Slam Champion (Normal, Plus button)

  #### Testimonial Quote Cards:
  1. **Weilynn T.** - WWC member
     - Quote: "Wish Waves Club continues to transform my approach to health and wellness daily."
  2. **Samatha R.** - WWC member (Tall card)
     - Quote: "Wish Waves Club has helped me greatly improve my physical health and wellbeing"

- **Call-to-Action**: "JOIN NOW" button at the bottom

**Visual Effects**:
- Masonry grid layout with varying card sizes
- Image overlays on ambassador cards
- Interactive buttons (play/plus icons)
- Scroll-triggered animations

---

### 5. Footer Section
**Component**: `Footer.jsx`  
**ID**: None

**Content**:
- **Brand Section**:
  - Wish Waves Club logo
  - Mission statement: "Our mission at Wish Waves Club is to unlock exclusive experiences and meaningful connections for our members."

- **Four Link Columns**:

  #### Support
  - Member Support
  - Order Status
  - Rejoin WWC
  - Member Login
  - WWC Community

  #### Company
  - Support
  - Careers
  - Our Mission
  - Press Center

  #### Legal
  - Terms of Use
  - Privacy Policy
  - Security
  - Cookie Policy

  #### Join WWC
  - Get WWC
  - Refer a Friend
  - Gift Membership
  - Corporate Gifting
  - Student Discount

- **Newsletter Section**:
  - Title: "Stay Connected"
  - Email input form
  - Submit button
  - Disclaimer: "By signing up, I agree with the data protection policy."

- **Copyright**: © 2025 Wish Waves Club

---

### 6. Floating Action Button
**Component**: `FloatingButton.jsx`  
**Position**: Fixed bottom-right corner

**Behavior**:
- Appears when user scrolls past 200px
- Hides when near the bottom of the page (within 100px of footer) or at the top
- **Action**: Scrolls smoothly to the Memberships section when clicked
- **Label**: "Join Now" with arrow icon

---

## Navigation Flow

### Primary Navigation (Header)
1. **Memberships** → Scrolls to `#memberships` section
2. **How it works** → Scrolls to `#how-it-works` (Note: Section may not exist yet)
3. **Why WWC** → Scrolls to `#why-wwc` (Note: Section may not exist yet)
4. **Benefits** → Scrolls to `#benefits` section (Features component)
5. **Events** → Scrolls to `#events` (Note: Section may not exist yet)

### Secondary Navigation (Footer Links)
- All footer links are currently anchor links (`#`) and may not have corresponding sections
- These appear to be placeholders for future pages/sections

### Call-to-Action Buttons
- **Header "Join Now"**: Currently no action defined
- **Header "Gift Membership"**: Currently no action defined
- **Hero "Join Now"**: Currently no action defined
- **Membership Cards CTAs**: Currently no action defined
- **Floating Button "Join Now"**: Scrolls to Memberships section

---

## Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Navigation Menu
│   └── Action Buttons
├── Hero
│   ├── LiquidEther (3D Animation)
│   └── Hero Content
├── Memberships
│   ├── Section Header
│   ├── Membership Cards (3 tiers)
│   └── Gift Section
├── Features
│   ├── Section Header
│   ├── Feature Cards (6 items)
│   └── Showcase Items (4 items)
├── Testimonials
│   ├── Testimonial Grid (8 cards)
│   └── CTA Button
├── Footer
│   ├── Brand Section
│   ├── Link Columns (4 columns)
│   ├── Newsletter Form
│   └── Copyright
└── FloatingButton
```

---

## Technical Details

### Scroll Animations
- Uses custom hook: `useScrollAnimation.js`
- Animations trigger when sections enter viewport
- Animation classes: `fade-in-up`, `fade-in-down`, `scale-in`, `fade-in-left`, `fade-in-right`
- Staggered animations for sequential element reveals

### 3D Graphics
- Uses Three.js and React Three Fiber
- LiquidEther component provides interactive liquid animation
- Configurable colors, mouse interaction, and auto-demo mode

### Responsive Design
- Mobile-friendly navigation with hamburger menu
- Responsive grid layouts for memberships and features
- Adaptive card layouts for testimonials

---

## Missing Sections & Planned Features

### Current Implementation Status
The website is currently implemented as a single-page application with sections. Based on the sitemap, the following sections/pages are planned but may not be fully implemented:

#### Navigation Links (Header)
The following header navigation links point to sections that may not exist yet:
- `#how-it-works` → Should link to "ABOUT MEMBERSHIP" → "HOW WE USE"
- `#why-wwc` → Should link to "ABOUT MEMBERSHIP" → "BENIFITS"
- `#events` → Should link to "HOME" → "UPCOMING EVENTS" or "NEWSROOM" → "UPCOMING EVENTS"

#### Planned Pages/Sections from Sitemap
1. **PRELOADER** - Loading screen before landing page
2. **REGISTRATION FORM** - User registration page
3. **PAYMENT GATEWAY** - Payment processing page
4. **HOME** → **INTRO. VIDEO** - Introduction video section
5. **HOME** → **UPCOMING EVENTS** - Events listing with event updater integration
6. **ABOUT MEMBERSHIP** → **HOW WE USE** - How membership works page
7. **ABOUT MEMBERSHIP** → **BENIFITS** → **MEMBER AS A VENDOR** - Vendor membership benefits
8. **MEMBERSHIP REGISTRATION** → **MEMBERSHIP APPLICATION** - Registration form
9. **VENDORS** - Vendor pages
10. **OFFERS & BENIFITS** - Offers showcase (may partially exist as Features section)
11. **SUPPORT** - Support pages
12. **ABOUT US** - Company information page
13. **NEWSROOM** → **UPCOMING EVENTS** - News-related events with social media hooks
14. **PRIVACY POLICY** - Standalone privacy policy page

### Implementation Recommendations
- Consider implementing React Router for multi-page navigation
- Create separate route components for each main section
- Implement the entry flow (Preloader → Registration → Payment → Landing)
- Add event management system integration for "Event Updater"
- Implement social media hooks for newsroom event pages

---

## Notes

1. **Single-Page Application**: No routing is implemented; all navigation uses anchor links
2. **No Backend Integration**: All buttons and forms appear to be UI-only (no API calls)
3. **Image Sources**: Some images use Unsplash URLs (testimonials), while others use local assets
4. **Accessibility**: ARIA labels are present on some interactive elements but could be expanded

---

## File Structure Reference

```
src/
├── App.jsx (Main component)
├── main.jsx (Entry point)
├── components/
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── Memberships.jsx
│   ├── Features.jsx
│   ├── Testimonials.jsx
│   ├── Footer.jsx
│   ├── FloatingButton.jsx
│   └── LiquidEther.jsx (3D animation)
└── hooks/
    └── useScrollAnimation.js
```

---

*Last Updated: Based on current codebase structure*

