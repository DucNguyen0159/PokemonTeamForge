# Asset Structure

## Overview

This document defines the asset architecture for PokemonTeamForge.

The asset system includes:
- Pokémon sprites
- trainer assets
- backgrounds
- icons
- UI graphics
- branding assets

The asset architecture should prioritize:
- organization
- scalability
- lightweight performance
- maintainability
- predictable naming
- responsive loading

The system should avoid:
- giant unorganized asset folders
- duplicated assets
- inconsistent naming
- oversized files
- unnecessary heavy media

---

# Asset Philosophy

PokemonTeamForge is primarily:
- a Team Builder platform
- a visual strategy platform
- a clean dashboard experience

Assets should therefore:
- support readability
- support visual clarity
- remain lightweight
- avoid visual clutter

The MVP should prioritize:
- optimized 2D assets
- clean visual consistency
- fast loading

Avoid:
- excessive animation
- giant media files
- unnecessary 3D rendering systems

---

# Asset Categories

Main asset categories:

1. Pokémon Sprites
2. Trainer Assets
3. Team Card Backgrounds
4. Type Icons
5. Item Icons
6. UI Assets
7. Branding Assets
8. Optional Decorative Assets

---

# Recommended Folder Structure

All static assets should live inside:

```text
public/
```

Recommended structure:

```text
public/
│
├── sprites/
├── trainers/
├── backgrounds/
├── types/
├── items/
├── ui/
├── logos/
├── placeholders/
└── icons/
```

---

# Pokémon Sprite System

## Overview

Pokémon sprites are one of the MOST IMPORTANT asset systems.

The MVP uses:
```text
2D Pokémon sprites
```

The Team Builder uses:
```text
normal sprites only
```

The Team Card Generator supports:
- normal sprites
- shiny sprites

---

# Sprite Folder Structure

Recommended:

```text
public/sprites/
│
├── normal/
└── shiny/
```

---

# Normal Sprite Folder

```text
public/sprites/normal/
```

Contains:
- standard Pokémon sprites

Examples:

```text
charizard.png
pikachu.png
garchomp.png
rotom-wash.png
```

---

# Shiny Sprite Folder

```text
public/sprites/shiny/
```

Contains:
- shiny Pokémon sprites

Examples:

```text
charizard.png
pikachu.png
garchomp.png
```

IMPORTANT:
Filenames should remain identical between:
- normal
- shiny

This simplifies sprite switching.

---

# Sprite Naming Rules

Use:
- lowercase
- kebab-case
- Pokémon slug names

GOOD:

```text
great-tusk.png
iron-valiant.png
rotom-wash.png
```

BAD:

```text
GreatTusk.png
rotomWash.PNG
```

---

# Sprite File Format

Recommended:
```text
PNG
```

Reason:
- transparency support
- Pokémon sprite compatibility
- lightweight enough for MVP

Avoid:
- JPEG
- giant WebP animations
- GIF sprites

---

# Sprite Resolution Philosophy

Recommended:
```text
96x96
128x128
```

The MVP should prioritize:
- clarity
- consistency
- fast loading

Avoid:
- inconsistent sprite dimensions
- giant oversized sprites

---

# Sprite Style Philosophy

The project should use:
```text
consistent sprite style
```

Avoid mixing:
- pixel sprites
- official artwork
- 3D renders
- fan art

inside the same UI system.

---

# 3D Model Philosophy

The MVP intentionally avoids:
- animated 3D Pokémon models
- WebGL rendering
- heavy animation systems

Reason:
- performance
- complexity
- free-tier optimization
- maintainability

Future support remains possible.

---

# Trainer Asset System

## Overview

Trainer assets are used primarily for:
- Team Card Generator

The MVP supports:
```text
preset trainer assets only
```

No custom user uploads.

---

# Trainer Folder Structure

```text
public/trainers/
```

---

# Trainer Categories

Recommended categories:

```text
official/
generic/
special/
```

Example:

```text
trainers/
│
├── official/
├── generic/
└── special/
```

---

# Official Trainers

Examples:

```text
red.png
blue.png
cynthia.png
steven.png
```

IMPORTANT:
Be mindful of copyright usage.

For MVP:
- placeholders
- simplified art
- non-commercial usage awareness

may be preferable.

---

# Generic Trainers

Examples:

```text
trainer-boy-01.png
trainer-girl-01.png
trainer-masked-01.png
```

These are safer for:
- branding
- originality
- long-term expansion

---

# Trainer Asset Philosophy

Trainer assets should:
- remain visually consistent
- fit Team Card layouts
- support transparency

Recommended:
```text
PNG with transparent background
```

---

# Team Card Background System

## Overview

Backgrounds are used for:
- Team Card Generator

The MVP supports:
```text
preset backgrounds only
```

No custom uploads.

---

# Background Folder Structure

```text
public/backgrounds/
```

---

# Background Categories

Recommended:

```text
elemental/
dark/
cyber/
stadium/
minimal/
```

Example:

```text
backgrounds/
│
├── elemental/
├── dark/
├── cyber/
├── stadium/
└── minimal/
```

---

# Background Design Philosophy

Backgrounds should:
- enhance readability
- avoid visual clutter
- support Pokémon visibility

Avoid:
- hyper-detailed backgrounds
- noisy patterns
- overwhelming effects

---

# Background Resolution Philosophy

Recommended:
```text
1920x1080
```

Reason:
- high-quality exports
- scalable previews
- desktop-friendly

---

# Type Icon System

## Overview

Type icons are used heavily throughout the application.

Examples:
- Pokédex
- Team Builder
- Coverage Analysis
- Recommendation Cards

---

# Type Icon Folder

```text
public/types/
```

---

# Type Icon Naming

Examples:

```text
fire.svg
water.svg
dragon.svg
fairy.svg
```

---

# Type Icon Format

Recommended:
```text
SVG
```

Reason:
- lightweight
- scalable
- crisp rendering
- easy recoloring

---

# Type Icon Philosophy

Type icons should:
- remain recognizable
- remain visually consistent
- support dark mode

Avoid:
- inconsistent art styles
- blurry PNG type icons

---

# Item Icon System

## Overview

Item icons support:
- Team Builder
- item dropdowns
- Team Cards optional

---

# Item Folder

```text
public/items/
```

---

# Item Naming Rules

Examples:

```text
leftovers.png
choice-scarf.png
heavy-duty-boots.png
```

---

# Item Asset Philosophy

The MVP may initially:
- simplify item visuals
- use lightweight icon systems

Avoid:
- giant detailed artwork collections

---

# UI Asset System

## Overview

UI assets support:
- loading states
- decorative graphics
- empty states
- dashboard visuals

---

# UI Folder

```text
public/ui/
```

---

# UI Asset Examples

Examples:

```text
loading-spinner.svg
empty-team.svg
empty-search.svg
coverage-pattern.svg
```

---

# UI Asset Philosophy

UI assets should:
- remain subtle
- support readability
- avoid visual overload

---

# Branding Asset System

## Overview

Branding assets include:
- logo
- favicon
- app icons

---

# Logo Folder

```text
public/logos/
```

---

# Recommended Branding Assets

Examples:

```text
logo.svg
logo-small.svg
favicon.ico
apple-touch-icon.png
```

---

# Logo Philosophy

PokemonTeamForge branding should feel:
- modern
- clean
- strategy-oriented

Avoid:
- hyper-cartoonish branding
- cluttered logos

---

# Placeholder Assets

## Purpose

Used during:
- loading
- incomplete states
- missing assets

---

# Placeholder Folder

```text
public/placeholders/
```

Examples:

```text
pokemon-placeholder.png
trainer-placeholder.png
background-placeholder.png
```

---

# Icon System

## Overview

General-purpose icons.

Main icon system:
```text
Lucide React
```

Avoid:
- mixing many icon libraries

---

# Custom Icon Folder

Optional:

```text
public/icons/
```

Used only for:
- project-specific graphics
- non-standard icons

---

# Asset Optimization Philosophy

Assets should remain:
- lightweight
- optimized
- compressed appropriately

Avoid:
- giant raw image files
- uncompressed PNGs
- excessive resolutions

---

# Recommended Asset Optimization

Use:
- compressed PNGs
- optimized SVGs
- modern image dimensions

Optional tools:
- TinyPNG
- SVGO

---

# Lazy Loading Philosophy

Heavy assets should use:
- lazy loading
- conditional rendering

Examples:
- Team Card backgrounds
- large preview assets

---

# Asset Loading Priority

High priority:
- Pokémon sprites
- type icons
- UI essentials

Lower priority:
- large backgrounds
- optional visuals
- decorative graphics

---

# Asset Reuse Philosophy

Avoid:
- duplicated assets
- multiple versions of identical images

Prefer:
- centralized reusable assets

---

# CDN Philosophy

The MVP may:
- store assets locally

Future optional improvements:
- CDN hosting
- image optimization pipelines

The MVP should prioritize:
- simplicity
- reliability
- maintainability

---

# Copyright Philosophy

IMPORTANT:
Pokémon assets are owned by Nintendo/Game Freak/The Pokémon Company.

The project should remain:
- educational
- portfolio-focused
- non-commercial

Avoid:
- monetization using copyrighted assets
- re-uploading massive official asset archives

---

# Asset Consistency Rules

All assets should follow:
- consistent naming
- consistent formatting
- consistent resolution philosophy
- consistent art direction

---

# Future Scalability

The asset structure should support future additions such as:
- animated sprites
- alternative themes
- additional trainer packs
- event backgrounds
- mobile app assets

without major restructuring.

---

# Important Development Rules

## Keep assets organized

Avoid:
```text
dumping everything into /public
```

---

# Use consistent naming

Prefer:
```text
lowercase-kebab-case
```

---

# Optimize assets before production

Avoid:
- giant uncompressed images
- unnecessary file sizes

---

# Keep MVP lightweight

The MVP should prioritize:
- performance
- maintainability
- simplicity

NOT:
- ultra-heavy visuals

---

# Final Goal

The asset system should provide:
- organized structure
- scalable architecture
- fast loading
- visual consistency
- lightweight performance
- maintainable asset management

The assets should support:
```text
a clean, modern, visually polished Pokémon strategy platform
```
without overwhelming:
- performance
- storage
- maintainability