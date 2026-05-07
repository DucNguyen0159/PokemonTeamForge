# UI Design System

## Overview

This document defines the UI Design System for PokemonTeamForge.

The design system exists to ensure:
- visual consistency
- scalable UI architecture
- reusable components
- predictable layouts
- maintainable styling
- clean user experience

The UI should feel:
- modern
- clean
- responsive
- polished
- lightweight
- readable

The visual style should take inspiration from:
- modern dashboard applications
- clean gaming interfaces
- Pokémon-inspired color systems

The UI should NOT feel:
- cluttered
- outdated
- noisy
- overly animated
- visually overwhelming

---

# Design Philosophy

PokemonTeamForge is primarily:
- a Team Builder platform
- a strategy analysis platform
- a visual team creation platform

The UI should prioritize:
- usability
- speed
- readability
- smooth workflows

The design should support:
- long Team Builder sessions
- rapid team editing
- easy information scanning
- real-time analysis visibility

---

# Overall Visual Style

The UI should feel like:
```text
Modern Pokémon strategy dashboard
```

Visual direction:
- dark-mode first
- card-based layouts
- soft contrast
- clean spacing
- lightweight gradients
- subtle depth
- strong readability

The visual hierarchy should remain:
- simple
- structured
- predictable

---

# Theme Philosophy

The MVP should prioritize:
- dark theme

Optional future support:
- light theme

Dark theme is preferred because:
- easier on eyes during long builder sessions
- Pokémon type colors stand out better
- modern dashboard aesthetic
- cleaner contrast system

---

# Primary Color Palette

Recommended palette:

## Background Colors

```text
Main Background:
#0f1117

Secondary Background:
#161b22

Card Background:
#1c2330

Elevated Card:
#232b3b
```

---

# Text Colors

```text
Primary Text:
#f1f5f9

Secondary Text:
#94a3b8

Muted Text:
#64748b
```

---

# Accent Colors

```text
Primary Accent:
#3b82f6

Hover Accent:
#60a5fa

Success:
#22c55e

Warning:
#f59e0b

Danger:
#ef4444
```

---

# Pokémon Type Colors

Pokémon type colors should remain recognizable to Pokémon fans.

Recommended examples:

```text
Fire:
#f97316

Water:
#3b82f6

Grass:
#22c55e

Electric:
#facc15

Ice:
#67e8f9

Fighting:
#dc2626

Poison:
#a855f7

Ground:
#ca8a04

Flying:
#7dd3fc

Psychic:
#ec4899

Bug:
#84cc16

Rock:
#a16207

Ghost:
#7c3aed

Dragon:
#6366f1

Dark:
#374151

Steel:
#94a3b8

Fairy:
#f9a8d4
```

IMPORTANT:
Type colors should:
- remain readable in dark mode
- avoid excessive saturation
- maintain contrast consistency

---

# Typography System

The typography should prioritize:
- readability
- hierarchy
- clarity

Recommended font:
```text
Inter
```

Alternative:
```text
Geist
```

---

# Typography Hierarchy

## Page Title

```text
32px
font-bold
```

Examples:
- Team Builder
- Pokédex
- Strategy Teams

---

# Section Titles

```text
20px
font-semibold
```

Examples:
- Defensive Coverage
- Recommendations
- Team Checklist

---

# Card Titles

```text
16px
font-medium
```

---

# Body Text

```text
14px
font-normal
```

---

# Small Metadata

```text
12px
text-muted
```

---

# Layout Philosophy

The layout should feel:
- spacious
- organized
- dashboard-oriented

Avoid:
- cramped layouts
- giant empty spaces
- inconsistent alignment

The UI should guide the user's eyes naturally.

---

# Main Layout Structure

Recommended global structure:

```text
Navbar
│
├── Main Content
│   ├── Left Content
│   └── Right Sidebar
```

---

# Team Builder Layout

The Team Builder is the most important page.

Recommended structure:

```text
LEFT SIDE
- Pokémon slots
- Team editing

RIGHT SIDE
- Defensive Coverage
- Offensive Coverage
- Team Checklist
- Recommendations
```

---

# Team Builder Width Philosophy

Recommended:
- wide desktop layout
- multi-column layout

Reason:
- Team Builder contains large amounts of information
- analysis systems should remain visible simultaneously

Avoid:
- excessive scrolling
- hidden analysis sections

---

# Card Design System

Cards are the primary UI container.

Cards should:
- separate content clearly
- maintain soft contrast
- provide subtle depth

Recommended card styling:

```text
rounded-2xl
soft shadow
thin border
slightly elevated background
```

Avoid:
- heavy borders
- harsh shadows
- excessive gradients

---

# Button Design System

Buttons should feel:
- clean
- responsive
- modern

Recommended styles:
- rounded-xl
- medium padding
- smooth hover transitions

---

# Primary Buttons

Used for:
- Add to Team
- Save Team
- Generate Card

Style:
```text
blue accent
white text
medium emphasis
```

---

# Secondary Buttons

Used for:
- Cancel
- Reset
- Back

Style:
```text
neutral background
muted text
```

---

# Danger Buttons

Used for:
- Remove Pokémon
- Delete Team

Style:
```text
red accent
```

---

# Button Interaction Philosophy

Buttons should provide:
- hover feedback
- active feedback
- disabled states

Avoid:
- flashy animations
- slow transitions
- distracting effects

---

# Input Design System

Inputs include:
- search bars
- dropdowns
- filters
- move selectors

Recommended styling:
```text
rounded-xl
dark background
soft border
clear focus state
```

---

# Search Input Philosophy

Search bars are extremely important.

The project contains:
- Pokémon search
- move search
- item search
- strategy search

Search interactions should feel:
- instant
- lightweight
- responsive

---

# Dropdown Design System

Dropdowns are heavily used in Team Builder.

Examples:
- Pokémon selector
- move selector
- item selector
- ability selector

Dropdowns should support:
- searchable content
- keyboard navigation
- smooth scrolling

Avoid:
- giant uncontrolled dropdown heights
- laggy search behavior

---

# Pokémon Slot Design

The Pokémon Slot is one of the most important UI components.

Each slot should contain:
- Pokémon sprite
- name
- typing
- item
- ability
- moves

The slot should remain:
- compact
- readable
- visually organized

---

# Sprite Philosophy

MVP Team Builder:
```text
2D normal sprites only
```

Reason:
- lighter assets
- better performance
- simpler implementation

The Team Card Generator supports:
- normal sprites
- shiny sprites

---

# Coverage UI Design

Coverage systems should prioritize:
- readability
- color clarity
- quick scanning

Weaknesses:
```text
red
```

Resistances:
```text
green
```

Immunities:
```text
blue or cyan
```

Neutral:
```text
gray
```

---

# Coverage Visualization Philosophy

Coverage data should feel:
- understandable
- informative
- visually compact

Avoid:
- giant spreadsheets
- overcomplicated tables
- excessive competitive jargon

---

# Recommendation Card Design

Recommendation cards should contain:
- Pokémon sprite
- Pokémon name
- typing
- score indicator optional
- short explanation

Cards should remain:
- compact
- scannable
- visually balanced

---

# Recommendation UI Philosophy

Recommendations should feel:
- supportive
- non-intrusive
- helpful

Avoid:
- giant walls of text
- overwhelming recommendation lists

---

# Team Checklist UI

Checklist items should visually indicate:
- completed
- missing
- partially supported

Recommended:
- green check
- yellow warning
- gray inactive

Avoid:
- overly harsh failure styling

The checklist should feel:
```text
guidance-oriented
```

NOT:
```text
punishment-oriented
```

---

# Pokédex UI Philosophy

The Pokédex should remain:
- lightweight
- fast
- visually clean

The Pokédex is NOT the primary feature.

Avoid:
- giant encyclopedic layouts
- excessive text blocks
- overloaded information density

---

# Pokédex Grid System

Recommended:
- responsive card grid
- searchable table/grid hybrid

Each Pokémon card should contain:
- sprite
- name
- type
- base stats summary

---

# Team Card Generator UI

This page should feel:
- visual
- creative
- polished

The page should emphasize:
- previews
- customization
- presentation

Users should clearly see:
- background selection
- trainer selection
- final exported result

---

# Animation Philosophy

Animations should remain:
- subtle
- lightweight
- purposeful

Recommended:
- fade transitions
- hover elevation
- soft opacity changes

Avoid:
- excessive motion
- flashy effects
- heavy particle systems

---

# Transition Philosophy

Recommended transition speed:

```text
150ms–250ms
```

The UI should feel:
- smooth
- responsive
- modern

---

# Icon System

Use:
- Lucide React

Icons should remain:
- consistent
- lightweight
- minimal

Avoid:
- mixing multiple icon systems

---

# Spacing System

Recommended spacing scale:

```text
4px
8px
12px
16px
24px
32px
48px
```

The UI should maintain:
- consistent padding
- consistent margins
- consistent gaps

---

# Border Radius Philosophy

Recommended:
```text
rounded-xl
rounded-2xl
```

Avoid:
- sharp corners
- inconsistent rounding

---

# Shadow Philosophy

Use:
- soft subtle shadows

Avoid:
- harsh black shadows
- excessive elevation

Recommended:
```text
shadow-md
shadow-lg
```

used sparingly.

---

# Responsive Design Philosophy

The website should be:
- desktop-first
- tablet-friendly
- mobile-compatible

The Team Builder is primarily optimized for:
- desktop usage

Reason:
- high information density
- multiple simultaneous systems

---

# Mobile UI Philosophy

Mobile layouts should:
- simplify side panels
- collapse sections
- maintain usability

Avoid:
- forcing desktop layout into mobile width

---

# Navigation Design

Navigation should remain:
- simple
- persistent
- easy to understand

Recommended navbar items:
- Home
- Builder
- Pokédex
- Strategies
- Team Cards
- Profile

Avoid:
- excessive navigation nesting

---

# Empty State Design

Empty states should feel:
- friendly
- informative
- non-intimidating

Examples:
- empty team slots
- no recommendations
- no saved teams

---

# Loading State Design

Use:
- skeleton loaders
- soft shimmer effects

Avoid:
- giant loading spinners blocking content

---

# Error State Design

Errors should remain:
- understandable
- recoverable
- visually clear

Avoid:
- technical developer errors shown to users

---

# Accessibility Philosophy

The UI should support:
- readable contrast
- keyboard navigation
- readable font sizes
- focus indicators

Avoid:
- tiny clickable elements
- unreadable type colors
- hidden focus states

---

# Design Consistency Rules

All pages should share:
- spacing system
- typography system
- card system
- button system
- color philosophy

Avoid:
- isolated page designs
- inconsistent UI patterns

---

# Future Scalability

The design system should support future features such as:
- light mode
- public profiles
- community pages
- battle simulator
- mobile app adaptation

without requiring major redesigns.

---

# Final UI Goal

PokemonTeamForge should feel like:
```text
A modern Pokémon strategy dashboard with clean UX,
strong readability,
fast workflows,
and visually polished team-building systems.
```

The UI should prioritize:
- clarity
- responsiveness
- usability
- visual consistency
- enjoyable long-term usage