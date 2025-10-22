# Documentation

Comprehensive documentation for the Next.js 15 e-commerce application built with CommerceTools and Contentful.

## Available Documentation

### Architecture & Infrastructure

- **[Caching Architecture](./caching-architecture.md)** - Detailed explanation of caching strategies for different page types (Home, PLP, PDP, Cart) and how they integrate with Vercel's platform. Covers ISR, edge runtime, cache tags, and on-demand revalidation.

## Quick Links

### For Developers

- [Caching Behavior by Page Type](./caching-architecture.md#caching-strategy-by-page-type)
- [Cache Tags & Revalidation](./caching-architecture.md#cache-tags--revalidation)
- [Vercel Platform Integration](./caching-architecture.md#vercel-platform-integration)

### For AI Assistants

Project-specific coding standards and guidelines are located in `.claude/docs/`:
- [.claude/docs/README.md](../.claude/docs/README.md) - Coding standards overview
- TypeScript, Next.js, Component guidelines, and more

## Documentation Structure

```
docs/
├── README.md                    # This file
└── caching-architecture.md      # Caching strategy documentation

.claude/docs/                    # Coding standards (for AI assistants)
├── README.md
├── typescript-standards.md
├── nextjs-patterns.md
└── ...
```

## Contributing

When adding new documentation:

1. Create a new `.md` file in this directory
2. Add it to the list in this README
3. Use clear headings and code examples
4. Include a table of contents for longer documents
5. Keep technical accuracy as the top priority

## Documentation Style Guide

- Use clear, descriptive headings
- Include code examples with comments
- Add tables for comparisons and reference data
- Use diagrams for complex architectures (ASCII or Mermaid)
- Keep explanations concise but complete
- Include "why" not just "what"
