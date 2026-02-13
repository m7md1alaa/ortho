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

### better-Convex Backend

- Define schemas in `convex/schema.ts`
- System fields `_id` and `_creationTime` auto-generated
- Add indexes for query optimization


| Aspect         | thing                                                   |
| -------------- | ------------------------------------------------------- |
| Validators     | don't : `v.string()` → do `z.string()`                             |
| Arguments      | don't `args: { ... }` →  do `instead .input(z.object({ ... }))`           |
| Handler params |  don't`(ctx, args)` →  do ` instead ({ ctx, input })`                      |
| Errors         |  don't`ConvexError` →  do ` instead CRPCError` with codes                  |
| Middleware     |  don't`customQuery` →  do ` instead .use()` with `next()`                  |
| Client hooks   |  don't`useQuery(api.x)` →  do `instead useQuery(crpc.x.queryOptions({}))` |
cRPC Builder
Better Convex introduces a tRPC-style builder for defining procedures. Instead of writing standalone functions, you chain methods to build queries and mutations with validation, middleware, and type inference.


// Before: Manual validation, no middleware
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getUser(ctx); // repeated everywhere
    if (!user) throw new Error('Unauthorized');
    return ctx.db.query('todos').take(args.limit ?? 10).collect();
  },
});
// After: Fluent API with middleware and Zod validation
export const list = authQuery
  .input(z.object({ limit: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    // ctx.user is already available from middleware
    return ctx.table('todos').take(input.limit ?? 10);
  });
The auth middleware runs once, adds user to context, and every procedure that uses authQuery gets it automatically. No more copy-pasting auth checks.

Real-time First
Convex queries are reactive—when data changes, subscribers get updates. Better Convex preserves this while giving you TanStack Query's API:


const { data, isPending } = useQuery(crpc.todos.list.queryOptions({}));
This single line does three things:

Fetches the initial data from Convex
Subscribes to real-time updates via WebSocket
Caches the result in TanStack Query's cache
Database Layer
Better Convex works with Convex's native database, but integrates seamlessly with ecosystem tools for enhanced capabilities.

Ents
Convex Ents adds relationships and a fluent query API. Instead of manual ID lookups, you traverse edges:


// Define relationships in schema
const schema = defineEntSchema({
  user: defineEnt({ name: v.string() })
    .edges('posts', { to: 'post', ref: 'authorId' }),
  post: defineEnt({ title: v.string() })
    .edge('author', { to: 'user', field: 'authorId' }),
});
// Query with relationships
const user = await ctx.table('user').getX(userId);
const posts = await user.edge('posts');
Ents makes your database feel like an ORM while keeping Convex's reactivity. The fluent API chains naturally with Better Convex's builder pattern.
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


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions  don't-forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
 Don't-use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
 Don't-define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully  don't-catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
 Don't-use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
 Don't-use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.
