# Initial Setup Instructions

## Overview

This document defines the complete initial setup process for PokemonTeamForge.

The project is built using:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- Supabase
- Vercel

The setup process is designed to prioritize:
- free-tier deployment
- modern frontend architecture
- scalable structure
- maintainable codebase
- strong developer experience
- AI IDE compatibility

The project should remain:
- lightweight
- scalable
- easy to deploy
- easy to maintain

---

# Development Environment

Recommended development environment:

## Code Editor

```text
Cursor IDE
```

Alternative:
```text
VS Code
```

---

# Recommended Browser

```text
Google Chrome
```

Optional:
```text
Microsoft Edge
```

---

# Recommended OS

Supported:
- Windows
- macOS
- Linux

Primary development target:
```text
Windows + Cursor IDE
```

---

# Required Software

Install the following before starting:

## Node.js

Recommended:
```text
Node.js LTS
```

Recommended version:
```text
20+
```

Download:
```text
https://nodejs.org
```

IMPORTANT:
Install BOTH:
- Node.js
- npm

---

# Git

Download:
```text
https://git-scm.com
```

Verify installation:

```bash
git --version
```

---

# GitHub Account

Required for:
- repository hosting
- version control
- Vercel deployment

---

# Supabase Account

Required for:
- PostgreSQL database
- authentication
- saved teams

Website:
```text
https://supabase.com
```

---

# Vercel Account

Required for:
- deployment
- hosting

Website:
```text
https://vercel.com
```

IMPORTANT:
Use GitHub login for easiest integration.

---

# Project Creation

## Step 1 — Clone Repository

Example:

```bash
git clone https://github.com/your-username/PokemonTeamForge.git
```

Then:

```bash
cd PokemonTeamForge
```

---

# Step 2 — Open Project

Open the project inside Cursor IDE.

Recommended:

```bash
code .
```

or open manually through Cursor.

---

# Step 3 — Create Next.js Project

Inside project root:

```bash
npx create-next-app@latest .
```

IMPORTANT:
The dot (`.`) installs into the current folder.

---

# Recommended create-next-app Options

## TypeScript

```text
Yes
```

---

# ESLint

```text
Yes
```

---

# Tailwind CSS

```text
Yes
```

---

# src/ Directory

```text
Yes
```

---

# App Router

```text
Yes
```

---

# Turbopack

```text
Yes
```

---

# Import Alias

```text
Yes
```

Recommended alias:

```text
@/*
```

---

# Initial Next.js Structure

After installation:

```text
PokemonTeamForge/
│
├── public/
├── src/
├── package.json
├── tsconfig.json
├── next.config.ts
└── ...
```

---

# Install Core Dependencies

Run:

```bash
npm install zustand @tanstack/react-query lucide-react html-to-image
```

---

# Dependency Purposes

## Zustand

Used for:
- Team Builder state
- filters
- UI state

---

# TanStack Query

Used for:
- API fetching
- caching
- async state

---

# Lucide React

Used for:
- icons

---

# html-to-image

Used for:
- Team Card PNG export

---

# Install shadcn/ui

Run:

```bash
npx shadcn@latest init
```

---

# Recommended shadcn Setup

## Base Color

Recommended:
```text
Slate
```

---

# CSS Variables

```text
Yes
```

---

# Tailwind Config

Use:
```text
tailwind.config.ts
```

---

# Recommended shadcn Components

Install gradually as needed.

Recommended early components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add scroll-area
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
npx shadcn@latest add badge
```

---

# Setup Tailwind CSS

Tailwind is installed automatically by create-next-app.

Recommended:
- keep utility-first styling
- avoid excessive custom CSS

---

# Global CSS Setup

Main file:

```text
src/app/globals.css
```

Recommended responsibilities:
- Tailwind imports
- CSS variables
- theme setup
- scrollbar styling
- global resets

Avoid:
- giant custom CSS systems

---

# Setup Folder Structure

Create recommended folders:

```text
src/
│
├── app/
├── components/
├── lib/
├── hooks/
├── store/
├── types/
├── data/
├── constants/
├── utils/
├── providers/
└── styles/
```

---

# Create Initial Component Structure

Recommended:

```text
src/components/
│
├── builder/
├── pokedex/
├── recommendation/
├── coverage/
├── checklist/
├── strategy/
├── team-card/
├── layout/
├── shared/
└── ui/
```

---

# Setup Zustand Store Folder

```text
src/store/
│
├── team-store.ts
├── recommendation-store.ts
├── filter-store.ts
├── ui-store.ts
└── auth-store.ts
```

---

# Setup Types Folder

```text
src/types/
```

Initial recommended files:

```text
pokemon.ts
team.ts
move.ts
ability.ts
item.ts
strategy.ts
recommendation.ts
coverage.ts
```

---

# Setup Data Folder

```text
src/data/
```

Recommended files:

```text
type-chart.ts
stat-tiers.ts
move-tags.ts
role-definitions.ts
```

---

# Setup Utility Folder

```text
src/utils/
```

Examples:
- string helpers
- formatting helpers
- sorting helpers

Avoid:
- placing business logic here

---

# Setup Calculation Systems

Create:

```text
src/lib/calculations/
```

Recommended structure:

```text
calculations/
│
├── defensive/
├── offensive/
├── checklist/
├── recommendation-support/
└── shared/
```

---

# Setup Recommendation System

Create:

```text
src/lib/recommendation/
```

Recommended structure:

```text
recommendation/
│
├── filters/
├── scoring/
├── penalties/
├── explanations/
├── candidates/
├── ranking/
├── synergy/
└── weights/
```

---

# Setup API Structure

Create:

```text
src/app/api/
```

Recommended routes:

```text
pokemon/
recommendation/
coverage/
checklist/
teams/
strategies/
team-card/
```

---

# Setup Supabase

## Step 1 — Create Supabase Project

Inside Supabase dashboard:

Create project:
```text
PokemonTeamForge
```

---

# Step 2 — Obtain Credentials

Get:
- Project URL
- anon public key

---

# Step 3 — Create Environment File

Create:

```text
.env.local
```

---

# Environment Variables

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

IMPORTANT:
Never commit secret keys.

---

# Git Ignore Verification

Ensure `.gitignore` contains:

```gitignore
.env
.env.local
.env.production
```

---

# Security Philosophy

Never commit:
- secret keys
- service_role keys
- private environment files

Safe:
```text
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Unsafe:
```text
SUPABASE_SERVICE_ROLE_KEY
```

---

# Setup Supabase Client

Recommended folder:

```text
src/lib/supabase/
```

Recommended files:

```text
client.ts
server.ts
middleware.ts
```

---

# Setup React Query Provider

Create:

```text
src/providers/query-provider.tsx
```

Wrap app inside:
```text
layout.tsx
```

---

# Setup Theme Provider

Recommended:
- dark mode default

Optional future:
- light mode support

---

# Setup Initial Layout

Main file:

```text
src/app/layout.tsx
```

Responsibilities:
- navbar
- providers
- global layout wrappers
- metadata

---

# Setup Initial Routes

Create:

```text
src/app/
│
├── page.tsx
├── builder/
├── pokedex/
├── strategies/
├── team-card/
├── profile/
├── login/
└── register/
```

---

# Recommended First Development Order

IMPORTANT:
Do NOT build everything at once.

Recommended order:

---

# Phase 1 — Foundation

Build:
- layout
- dark theme
- navbar
- routing
- folder structure

---

# Phase 2 — Team Builder Skeleton

Build:
- Pokémon slots
- Team Builder layout
- empty coverage panels
- basic state management

---

# Phase 3 — Pokémon Data

Implement:
- Pokémon fetching
- search systems
- dropdown systems

---

# Phase 4 — Core Calculations

Implement:
- defensive coverage
- offensive coverage
- checklist systems

---

# Phase 5 — Recommendation Engine

Implement:
- filters
- scoring
- recommendation cards

---

# Phase 6 — Strategy Teams

Implement:
- preset teams
- strategy browsing
- load into builder

---

# Phase 7 — Team Card Generator

Implement:
- backgrounds
- trainer selection
- PNG export

---

# Phase 8 — Authentication & Saved Teams

Implement:
- login
- save team
- load team

---

# Local Development

Run development server:

```bash
npm run dev
```

Default:
```text
http://localhost:3000
```

---

# Recommended Git Workflow

Commit frequently.

Recommended commit style:

```text
feat: add team builder layout
feat: implement defensive coverage
fix: correct offensive coverage bug
refactor: optimize recommendation scoring
```

---

# Recommended Branch Strategy

Simple MVP approach:

```text
main
```

Optional later:
```text
dev
feature/*
```

---

# Deployment Setup

## Vercel Deployment

Connect:
- GitHub repository
- Vercel project

Deployment should remain:
- automatic
- GitHub-connected

---

# Recommended Deployment Flow

```text
Push to GitHub
→ Vercel Auto Deploy
→ Production Update
```

---

# Environment Variables in Vercel

Add:
- Supabase URL
- Supabase anon key

inside:
```text
Vercel Project Settings
→ Environment Variables
```

---

# Performance Setup Philosophy

Avoid:
- giant packages
- unnecessary animation libraries
- excessive dependencies

The MVP should remain:
- lightweight
- fast
- maintainable

---

# Recommended Developer Tools

Optional:
- Prettier
- ESLint extensions
- Tailwind IntelliSense

Highly recommended for Cursor IDE.

---

# Initial Testing Philosophy

Early testing should focus on:
- Team Builder responsiveness
- dropdown performance
- recommendation updates
- coverage correctness

---

# Important Development Rules

## Build incrementally

Avoid:
```text
trying to finish the entire project immediately
```

---

## Prioritize Team Builder first

The Team Builder is the core platform feature.

---

## Keep business logic separated

Business logic:
```text
src/lib/
```

UI:
```text
src/components/
```

State:
```text
src/store/
```

---

## Avoid premature optimization

Keep MVP:
- clean
- understandable
- scalable

---

# Final Goal

The initial setup should create:
- a scalable architecture
- a production-ready foundation
- a modern frontend environment
- an AI IDE friendly codebase
- a maintainable long-term project

The setup should allow development to proceed:
- cleanly
- incrementally
- predictably