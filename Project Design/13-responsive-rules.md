# Responsive Rules

## Overview

This document defines the responsive design rules for PokemonTeamForge.

The responsive system exists to ensure:
- usability across devices
- layout consistency
- readable interfaces
- scalable UI behavior
- smooth Team Builder experience
- predictable adaptive layouts

PokemonTeamForge is primarily:
- a desktop-first application
- a strategy dashboard
- a Team Builder platform

The responsive architecture should prioritize:
- desktop usability
- tablet compatibility
- mobile accessibility

The responsive system should avoid:
- broken layouts
- overcrowded mobile screens
- horizontal scrolling
- unreadable interfaces
- inconsistent spacing
- duplicated mobile pages

---

# Responsive Philosophy

PokemonTeamForge is designed primarily for:
```text
desktop usage
```

Reason:
- high information density
- multiple simultaneous analysis systems
- team-building workflows
- dashboard-style interactions

The application should still remain:
- tablet-friendly
- mobile-compatible

However:
```text
desktop experience is the priority
```

---

# Device Priority

Recommended priority order:

```text
1. Desktop
2. Tablet
3. Mobile
```

The Team Builder especially should prioritize:
- widescreen usability
- multi-panel visibility
- simultaneous analysis display

---

# Responsive Breakpoints

Recommended Tailwind breakpoints:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Recommended responsive strategy:

```text
Mobile:
< 768px

Tablet:
768px – 1023px

Desktop:
1024px+
```

---

# Desktop Layout Philosophy

Desktop layouts should:
- maximize visibility
- minimize scrolling
- support side-by-side panels
- emphasize dashboard structure

The Team Builder should feel:
```text
like a strategy workstation
```

---

# Tablet Layout Philosophy

Tablet layouts should:
- remain usable
- preserve important analysis visibility
- reduce overcrowding

Recommended:
- partial panel stacking
- collapsible sections
- reduced spacing density

Avoid:
- fully desktop-compressed layouts

---

# Mobile Layout Philosophy

Mobile layouts should:
- simplify structure
- reduce simultaneous information density
- prioritize readability

IMPORTANT:
Mobile should remain:
- functional
- usable

but not necessarily:
```text
feature-dense
```

---

# Mobile UX Philosophy

The mobile experience should prioritize:
- quick edits
- basic team browsing
- lightweight interactions

The mobile UX should avoid:
- overwhelming simultaneous panels
- giant dense dashboards
- tiny interaction targets

---

# Main Layout Responsive Rules

## Desktop

Recommended:

```text
Sidebar/Navbar
│
├── Main Content
│   ├── Left Builder Area
│   └── Right Analysis Sidebar
```

---

# Tablet

Recommended:

```text
Builder Area
│
├── Coverage
├── Checklist
└── Recommendations
```

Some sections may stack vertically.

---

# Mobile

Recommended:

```text
Team Builder
│
├── Collapsible Coverage
├── Collapsible Checklist
└── Collapsible Recommendations
```

Use:
- accordion sections
- tabs
- collapsible cards

to reduce clutter.

---

# Team Builder Responsive Rules

The Team Builder is the MOST IMPORTANT responsive challenge.

---

# Desktop Team Builder

Desktop should display:
- team slots
- coverage
- checklist
- recommendations

simultaneously whenever possible.

Recommended:
```text
2-column or 3-column layout
```

---

# Tablet Team Builder

Tablet should:
- partially collapse side panels
- reduce simultaneous visible density

Recommended:
- stack analysis sections below builder

---

# Mobile Team Builder

Mobile should:
- prioritize Pokémon slots first
- move analysis into collapsible sections

Recommended order:

```text
1. Team Slots
2. Coverage
3. Checklist
4. Recommendations
```

---

# Mobile Team Builder Philosophy

Mobile users should still be able to:
- build teams
- edit moves
- use recommendations
- view analysis

without:
- visual overload
- impossible navigation

---

# Pokémon Slot Responsive Rules

Pokémon slots should remain:
- readable
- touch-friendly
- compact

---

# Desktop Pokémon Slots

Desktop slots may include:
- sprite
- name
- typing
- item
- ability
- move list

all simultaneously visible.

---

# Tablet Pokémon Slots

Tablet slots may:
- slightly reduce spacing
- reduce visible metadata density

---

# Mobile Pokémon Slots

Mobile slots should:
- stack vertically
- simplify spacing
- prioritize readability

Avoid:
- tiny compressed rows

---

# Search Modal Responsive Rules

Search modals are heavily used.

The UX must remain smooth on all devices.

---

# Desktop Search Modals

Desktop:
- centered modal
- wide searchable list
- keyboard-friendly

---

# Mobile Search Modals

Mobile:
- full-screen modal preferred
- large search input
- touch-friendly results

Avoid:
- tiny floating modals on mobile

---

# Dropdown Responsive Rules

Dropdowns should:
- remain scrollable
- remain readable
- support touch interaction

---

# Mobile Dropdown Rules

On mobile:
- use larger touch targets
- increase spacing
- increase row height

Avoid:
- extremely dense dropdown lists

---

# Coverage Panel Responsive Rules

Coverage analysis contains dense information.

The UI must adapt carefully.

---

# Desktop Coverage Panels

Desktop:
- always visible
- side-by-side if possible

---

# Tablet Coverage Panels

Tablet:
- stacked vertically
- still expanded by default

---

# Mobile Coverage Panels

Mobile:
- collapsible sections
- accordion-based layout recommended

Avoid:
- giant static coverage tables

---

# Recommendation Panel Responsive Rules

Recommendations should remain:
- visible
- readable
- easy to scan

---

# Desktop Recommendation Layout

Desktop:
- sidebar cards
- multiple visible recommendations

---

# Mobile Recommendation Layout

Mobile:
- vertical card stack
- swipe-friendly optional
- compact explanation text

Avoid:
- giant recommendation paragraphs

---

# Checklist Responsive Rules

Checklist items should remain:
- touch-friendly
- easy to scan

On mobile:
- larger spacing
- simplified grouping

---

# Pokédex Responsive Rules

The Pokédex should adapt smoothly.

---

# Desktop Pokédex

Desktop:
- grid layout
- multi-column browsing

Recommended:
```text
4–6 cards per row
```

---

# Tablet Pokédex

Recommended:
```text
2–4 cards per row
```

---

# Mobile Pokédex

Recommended:
```text
1–2 cards per row
```

Avoid:
- overly tiny cards

---

# Pokémon Detail Page Responsive Rules

Desktop:
- side-by-side layout

Example:

```text
Sprite | Stats | Moves
```

---

# Mobile Pokémon Detail Layout

Recommended:
- stacked vertical sections

Example:

```text
Sprite
Stats
Abilities
Moves
```

---

# Team Card Generator Responsive Rules

This page is highly visual.

The preview should remain:
- centered
- readable
- scalable

---

# Desktop Team Card Layout

Desktop:
- live preview beside controls

---

# Mobile Team Card Layout

Mobile:
- preview above controls

Avoid:
- side-by-side cramped controls

---

# Navbar Responsive Rules

## Desktop Navbar

Desktop:
- full horizontal navbar

---

# Mobile Navbar

Mobile:
- hamburger menu
- slide-out navigation

Avoid:
- overcrowded top navigation

---

# Spacing Responsive Rules

Spacing should reduce slightly on smaller screens.

Desktop:
```text
larger spacing
```

Mobile:
```text
tighter spacing
```

But avoid:
- cramped layouts

---

# Typography Responsive Rules

Typography should scale responsively.

---

# Desktop Typography

Desktop:
- larger headings
- more whitespace

---

# Mobile Typography

Mobile:
- smaller headings
- tighter vertical rhythm

BUT:
- maintain readability

Avoid:
- tiny text

---

# Button Responsive Rules

Buttons should remain:
- touch-friendly
- easy to click

Recommended minimum touch height:

```text
44px
```

---

# Mobile Interaction Rules

On mobile:
- prioritize touch ergonomics
- avoid tiny interactive elements

---

# Hover Behavior Rules

Desktop:
- hover effects allowed

Mobile:
- avoid hover-dependent interactions

Important:
Never rely on hover-only interactions for core functionality.

---

# Scroll Behavior Rules

Avoid:
- nested scroll containers
- excessive horizontal scrolling

Prefer:
- vertical stacking
- collapsible sections

---

# Horizontal Scrolling Rules

The application should avoid:
```text
horizontal scrolling on mobile
```

except in rare controlled cases.

---

# Modal Responsive Rules

Desktop:
- centered floating modal

Mobile:
- full-screen modal preferred

This improves:
- usability
- readability
- touch interaction

---

# Animation Responsive Rules

Mobile should use:
- lighter animations
- reduced motion intensity

Reason:
- performance
- battery efficiency
- smoother UX

---

# Performance Responsive Philosophy

Responsive behavior should NOT:
- significantly increase render cost
- create heavy layout recalculations

Avoid:
- excessive breakpoint complexity
- duplicated layouts
- multiple hidden DOM trees

---

# Accessibility Responsive Rules

Responsive layouts should maintain:
- readable contrast
- accessible touch sizes
- keyboard navigation
- visible focus states

---

# Responsive Testing Philosophy

The application should be tested at:
- 320px
- 768px
- 1024px
- 1440px

Priority pages:
- Team Builder
- Pokédex
- Team Card Generator

---

# Important Responsive Rules

## Do NOT build separate mobile pages

Use:
```text
responsive layouts
```

NOT:
```text
duplicate mobile routes
```

---

# Keep responsive logic predictable

Avoid:
- overly complex breakpoint behavior
- inconsistent layout switching

---

# Prioritize desktop builder quality

Desktop Team Builder quality is the MOST IMPORTANT responsive priority.

---

# Keep mobile functional, not overloaded

Mobile should remain:
- usable
- readable
- lightweight

Avoid:
- forcing desktop density into mobile layouts

---

# Future Scalability

The responsive architecture should support future features such as:
- community systems
- battle simulator
- advanced analytics
- mobile applications

without requiring major layout rewrites.

---

# Final Goal

PokemonTeamForge should feel:
```text
responsive, modern, readable, and usable across all devices
```

while still prioritizing:
```text
desktop-first strategy dashboard workflows
```

The responsive system should provide:
- smooth adaptation
- consistent layouts
- readable interfaces
- scalable UI behavior
- strong Team Builder usability