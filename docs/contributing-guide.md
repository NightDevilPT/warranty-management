# Contributing Guide

## Quick Start

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/<feature-name>`
3. **Make your changes**
4. **Commit**: Follow the commit convention below
5. **Push**: `git push origin feature/<feature-name>`
6. **Open a Pull Request**

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>
```

### Types:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test-related changes
- `chore:` Maintenance tasks
- `perf:` Performance improvements
- `ci:` CI/CD changes

### Examples:

```bash
git commit -m 'feat: add product registration form'
git commit -m 'fix: resolve claim validation issue'
git commit -m 'docs: update API documentation'
```

## Pre-commit Checks

### Setup

After cloning the repository, install dependencies and set up Husky hooks:

```bash
pnpm install
pnpm prepare
```

### What Runs on Commit

**Pre-commit hook** (runs automatically before each commit):

- **Code formatting**: Prettier formats staged files (`.ts`, `.tsx`, `.js`, `.jsx`, `.md`, `.json`)
- **Linting**: ESLint fixes auto-fixable issues in staged files

**Commit-msg hook** (validates commit message format):

- Ensures commit messages follow the conventional commit format
- Validates commit type (feat, fix, docs, etc.)
- Rejects commits that don't match the format

### Bypassing Hooks (Not Recommended)

If you need to bypass hooks in an emergency:

```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning**: Only use `--no-verify` when absolutely necessary, as it skips all quality checks.

## Testing

Run tests before committing:

```bash
pnpm test
# Or for specific apps:
pnpm --filter admin test
pnpm --filter server test
```

## Questions?

Create an issue or discussion in GitHub.
