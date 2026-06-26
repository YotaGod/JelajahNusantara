# Contributing Guide - Jelajah Nusantara

Thank you for your interest in contributing to Jelajah Nusantara! Following these guidelines helps ensure a smooth collaboration process.

---

## 1. Branch Strategy

We follow a simplified Git-flow workflow:
- **`main`**: The stable branch representing production-ready code. No direct commits allowed on `main` unless it's a minor documentation fix.
- **`feature/AmazingFeature`**: Branch off `main` for developing new features.
- **`bugfix/IssueName`**: Branch off `main` for fixing bugs.
- **`hotfix/UrgentFix`**: Branch off `main` for critical patches that need to be deployed to production immediately.

---

## 2. Commit Message Conventions

We encourage semantic commit messages to keep our history clean and readable:

- **`feat:`**: A new feature (e.g., `feat: implement user badges gamification`)
- **`fix:`**: A bug fix (e.g., `fix: resolve island filter navigation race condition`)
- **`docs:`**: Documentation changes (e.g., `docs: update setup guide for Supabase`)
- **`style:`**: Changes that do not affect code logic (e.g., CSS edits, code formatting)
- **`refactor:`**: Code restructuring without changing functional behavior
- **`chore:`**: General maintenance tasks (e.g., updating dependencies, cleaning files)

---

## 3. Pull Request Guidelines

1. **Pull and Rebase**: Always pull the latest changes from `main` and rebase your branch before submitting a Pull Request:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/AmazingFeature
   git rebase main
   ```
2. **Build Verification**: Make sure your local codebase compiles and builds successfully without TypeScript compilation errors:
   ```bash
   npm run build
   ```
3. **Pull Request Details**: Describe the problem and outline your changes. List any breaking changes, database migration steps, or new environment variables introduced.

---

## 4. Coding Standards

- **TypeScript**: Strictly type your code. Avoid using `any` unless absolutely necessary (or during relationship mapping from Supabase tables).
- **CSS Modules**: Keep styles component-scoped by using `.module.css` files instead of global CSS rules.
- **Next.js Conventions**: Place pages inside the appropriate `src/app` directories. Keep Client Components light; favor Server Components where data fetching is straightforward.
- **RLS Awareness**: Do not perform role updates or sensitive profile updates on the client side, as database triggers will roll back illegal operations.
