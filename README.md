# Ortho

> Spelling as craft — Build precision through deliberate practice.

Ortho is a modern spelling practice application designed to help you master vocabulary through intentional, focused learning. Inspired by something like [Monkeytype](https://monkeytype.com/), this project aims to provide a similar minimalist and focused experience for spelling practice.

## Features

- **Custom Word Lists** — Curate your vocabulary by subject, difficulty, or personal relevance
- **Spaced Review** — Practice at optimal intervals using time-tested scheduling for lasting retention
- **Audio Guidance** — Hear correct pronunciation with built-in speech synthesis
- **Community Discovery** — Browse and practice with public word lists
- **Track Progress** — Monitor your mastery across lists with detailed statistics

## Tech Stack

> This project intentionally uses the latest and most hyped packages to experiment with cutting-edge technology in a real-world application setting.

- **Frontend**: Tanstack Start with React 19, TanStack Router, TanStack Query
- **Backend**: Convex (real-time database & serverless functions)
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **Tooling**: Biome (lint/format), Vitest (testing)
- **UI**: Base UI + shadcn-ui ([base-ui.com](https://base-ui.com/)) — now actively maintained, the modern successor to Radix UI which is no longer maintained
- **Bun**: bun package manger and bun runtime (buntime)

## Getting Started

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- Convex account (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/m7md1alaa/ortho
cd ortho

# Install dependencies
bun install
```

### Setup Convex

```bash
# Initialize Convex
bunx better-convex dev

# This will set up your Convex deployment and environment variables
```

### Development

```bash
# Start the development server
bun run dev
```

Visit `http://localhost:5173` to see the application.

## Build & Test

```bash
# Build for production
bun run build

# Preview production build
bun run preview

# Run tests
bun run test

# Run tests in watch mode
bunx vitest
```

## Code Quality

```bash
# Format code
bun run format

# Lint code
bun run lint

# Check both
bun run check

# Auto-fix issues
bunx biome check --write
```

## Project Structure

```
src/
  components/     # React components
  routes/         # TanStack Router file-based routes
  lib/            # Utilities and helpers
  types/          # Zod schemas and TypeScript types
  store/          # TanStack Store for clien state

convex/
  schema.ts       # Database schema
  *.ts            # Queries and mutations
```

## Adding UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/). Add components using:

```bash
bunx --bun shadcn@latest add button
```

## Routing

TanStack Router uses file-based routing. Routes are defined in `src/routes`:

- `/` — Landing page
- `/discover` — Browse public word lists
- `/lists` — Your personal word lists
- `/practice/$listId` — Practice a specific list

## Authentication

Authentication is handled through Better Auth with Convex integration. Sign in/out flows are managed in the header component.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

ISC License — feel free to use this project for your own learning or as a starting point for your applications.
