# Contributing to Ortho

Thank you for your interest in contributing to Ortho! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/m7md1alaa/ortho
   cd ortho
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Set up Convex:
   ```bash
   bunx better-convex dev
   ```
5. Start the development server:
   ```bash
   bun run dev
   ```

## Development Workflow

### Branching

- Create a new branch for your feature or bugfix:
  ```bash
  git checkout -b feature/your-feature-name
  # or
  git checkout -b fix/your-bugfix-name
  ```

### Code Quality

Before committing, run:
```bash
# Format code
bun run format

# Lint code
bun run lint

# Run tests
bun run test
```

### Commit Messages

Follow conventional commit format:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `style:` — formatting, missing semicolons, etc. (no code change)
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests
- `chore:` — build process or auxiliary tool changes

Example:
```
feat: add dark mode toggle
fix: resolve authentication redirect issue
```

## Coding Standards

### React

- Use functional components with explicit return types
- Call hooks at the top level only
- Specify all dependencies in hook dependency arrays correctly
- Use semantic HTML and ARIA attributes for accessibility

### Styling

- Use Tailwind CSS v4 utility classes
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Dark theme is the default

### Loading States

- Never use text with "..." for loading states
- For buttons: use the `loading` prop on the Button component
- For other loading: use the Spinner component
- For pages/sections: use the Skeleton component

## Submitting Changes

### Pull Request Process

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Create a pull request on GitHub
3. Fill in the PR template with a clear description of changes
4. Ensure all checks pass

### PR Description Guidelines

- Explain the motivation for the change
- Provide a summary of changes made
- Include screenshots for UI changes
- Reference related issues

## Questions?

Feel free to open an issue for questions or discussion about potential contributions.
