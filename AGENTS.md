# Agent Instructions for Ortho

## Build Commands

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Test Commands

```bash
# Run all tests
bun run test

# Run tests in watch mode
bunx vitest

# Run a single test file
bunx vitest run path/to/test.ts

# Run tests matching a pattern
bunx vitest run -t "test name pattern"
```

## Lint/Format Commands

```bash
# Format code
bun run format

# Lint code
bun run lint

# Check both format and lint
bun run check

# Apply fixes
bunx biome check --write
```

## Code Style Guidelines

### TypeScript

- Target: ES2022, strict mode enabled
- Use `type` over `interface` for object shapes
- Path alias: `@/` maps to `./src/`
- No unused locals or parameters (enforced)

### Imports

- Use `@/` path aliases for src imports
- Group imports: React, third-party, local
- Biome auto-organizes imports on save

### Formatting

- Tabs for indentation
- Double quotes for strings
- Semicolons required
- Biome handles formatting

### Naming Conventions

- Components: PascalCase (e.g., `Header.tsx`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: PascalCase for components, camelCase for utilities

### React

- Use React 19 with React Compiler
- Functional components with explicit return types
- Hooks at top of component
- Destructure props in component parameters

### Styling

- Tailwind CSS v4 with `@tailwindcss/vite`
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Dark theme default (black bg, zinc accents)

### Error Handling

- Use Zod for runtime validation
- Convex errors: handle in queries/mutations
- React errors: use error boundaries

### Convex Backend

- Use `v` validator from `convex/values`
- Define schemas in `convex/schema.ts`
- System fields `_id` and `_creationTime` auto-generated
- Add indexes for query optimization

### shadcn/ui

```bash
# Add components (always use bunx --bun)
bunx --bun shadcn@latest add button
```

## Project Structure

```
src/
  components/     # React components
  routes/         # TanStack Router file routes
  lib/            # Utilities (cn, etc.)
  types/          # Zod schemas and types
  store/          # TanStack Store
  integrations/   # Convex, TanStack Query providers
convex/
  schema.ts       # Database schema
  *.ts            # Queries and mutations
```

## Key Technologies

- React 19 + React Router (TanStack)
- TanStack Query + Start
- Convex backend
- Tailwind CSS v4
- Biome (lint/format)
- Vitest (testing)
- Zod (validation)
