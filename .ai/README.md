# AI/LLM Guardrails

This directory contains guardrails and coding standards that should be followed when making changes to this codebase. These rules are similar to Architecture Decision Records (ADRs) but focus on code style, patterns, and best practices.

## Purpose

These guardrails ensure:
- Consistent code style across the codebase
- Adherence to Next.js 15 and React best practices
- Type safety and maintainability
- Proper architectural patterns

## Files

- **`typescript-standards.md`** - TypeScript rules and type safety requirements
- **`nextjs-patterns.md`** - Next.js 15 specific patterns and conventions
- **`file-organization.md`** - File structure and naming conventions
- **`error-handling.md`** - Error handling and API response patterns
- **`caching-strategy.md`** - Caching and revalidation patterns
- **`component-guidelines.md`** - React component best practices
- **`testing-requirements.md`** - Testing standards and requirements

## How to Use

When making changes to the codebase:

1. Review relevant guardrail documents before implementing features
2. Ensure all changes comply with the standards defined here
3. Update guardrails if new patterns emerge or decisions change
4. Reference specific guardrail sections in code reviews

## Enforcement

These guardrails should be enforced through:
- Code reviews
- ESLint configuration
- TypeScript strict mode
- Automated tests
- LLM/AI assistant adherence during code generation
