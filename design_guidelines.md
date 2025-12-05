# Kitchen Conversion App Design Guidelines

## Design Approach
**Reference-Based Approach** - Drawing inspiration from utility-focused apps like Calculator (iOS), Google Calculator, and conversion apps that prioritize clarity and ease of use. The design emphasizes functional minimalism with touch-friendly interactions.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 220 15% 25% (Deep blue-gray for headers, active states)
- Background: 0 0% 98% (Off-white for main background)
- Surface: 0 0% 100% (Pure white for cards, active tab folder)
- Text Primary: 220 15% 20%
- Text Secondary: 220 10% 50%
- Border: 220 15% 90%
- Accent: 200 100% 45% (Bright blue for conversion results)

**Dark Mode:**
- Primary: 220 15% 75% (Light blue-gray)
- Background: 220 15% 8% (Very dark blue-gray)
- Surface: 220 15% 12% (Dark surface for cards)
- Text Primary: 220 15% 90%
- Text Secondary: 220 10% 65%
- Border: 220 15% 20%
- Accent: 200 80% 60% (Softer blue for dark mode)

### B. Typography
- **Primary Font:** Inter (Google Fonts) for all UI text
- **Display Font:** Inter (weights: 400, 500, 600)
- **Conversion Numbers:** Tabular numbers with increased letter-spacing for clarity
- **Sizes:** Large display numbers for conversion results, medium for units, small for labels

### C. Layout System
**Spacing:** Consistent use of Tailwind units: 2, 4, 6, 8, 12, 16
- Component padding: p-4 or p-6
- Section margins: mb-8 or mb-12
- Element spacing: gap-4 or gap-6
- Touch targets: minimum h-12 (48px) for mobile accessibility

### D. Component Library

**Tab System:**
- File folder-style tabs with rounded top corners
- Active tab appears as raised folder with white/surface background
- Inactive tabs have subtle background tint
- Minimum touch target of 48px height
- Clear visual hierarchy with shadows and borders

**Conversion Interface:**
- Central equation display with large, readable numbers
- Scrollable wheel selectors with momentum scrolling
- Selected item highlighted with accent color background
- Smooth animations between selections (200ms ease-out)

**Input Methods:**
- **Imperial:** Fraction wheel selector (1/4, 1/2, 3/4, whole numbers)
- **Metric:** Decimal keypad overlay with 2 decimal place limit
- Touch-friendly button sizing (minimum 44px)

**Ad Placement:**
- Horizontal banner above tabs (320x50 standard)
- Square banner below active folder content (300x250)
- Subtle borders to separate from content
- Muted background to avoid distraction

### E. Animations
**Minimal Approach:**
- Tab switching: Gentle slide transition (300ms)
- Wheel scrolling: Natural momentum with subtle bounce
- Number changes: Quick fade transition (150ms)
- NO distracting or excessive animations

## Mobile-First Considerations
- Touch targets minimum 44px for accessibility
- Generous spacing between interactive elements
- Swipe gestures for wheel selectors
- Keyboard-friendly decimal input with proper number pad
- Responsive text sizing that scales appropriately
- Single-column layout optimized for portrait orientation

## Key Interaction Patterns
- Immediate visual feedback on touch
- Real-time conversion updates as user scrolls
- Clear visual distinction between input and output values
- Intuitive wheel behavior matching native iOS/Android patterns
- Smooth transitions between metric and imperial input modes

This design prioritizes clarity, speed, and mobile usability while maintaining a clean, professional appearance suitable for a kitchen environment where hands may be messy or occupied.

## Content Style Guide

### Legal Document Pages (Privacy Policy, Terms of Service)

**Section Title Formatting:**
- No numbers or prefixes (e.g., "1.", "2.", etc.)
- Only capitalize the first letter of the title
- Use lowercase for all other words (e.g., "Use of the website", not "Use of The Website")
- Keep titles concise and descriptive

**Examples:**
✅ "Information we collect"
✅ "Cookies and advertising"
✅ "Use of the website"
❌ "1. Information We Collect"
❌ "2. Cookies And Advertising"

**Page Title Hierarchy:**
- Page titles (h1): `text-3xl` or `text-4xl` for clear visual hierarchy
- Section titles (h2): `text-2xl` to maintain proper hierarchy below page titles