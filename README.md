# Reporting Bugs

> [!IMPORTANT]  
> Follow these steps to submit a bug report

If you encounter a bug, please report it using our GitHub issue template:

1. Go to the [Issues](https://github.com/FrostWalk/Frontend/issues) page
2. Click on **New Issue**
3. Select the **Bug Report** template
4. Fill in all required sections:
   - **Summary**: Clear description of the bug or unexpected behavior
   - **Steps to Reproduce**: Detailed steps of what you did that caused the issue
   - **Expected Behavior**: What you expected to happen
   - **Actual Behavior**: What actually happened instead
   - **Request ID**: The unique request ID from error messages (found in toasts)
   - **Screenshots/Photos**: If applicable, to help explain the problem
   - **Error Messages**: Any error messages from the browser console
   - **Contact Information**: (If you want) Your email/Telegram so I can reach out if needed

This helps me understand and fix issues more efficiently.

---

# Development

### Prerequisites

- Node.js
- pnpm

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Generate API client from OpenAPI spec:

```bash
pnpm run generate:api
```

This fetches the latest OpenAPI specification from `https://dev.advancedprogramming.ovh/api/swagger-openapi.json` and generates TypeScript types and API client.

3. Copy environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
# For local development (default)
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080

# For connecting to dev API
# NUXT_PUBLIC_API_BASE_URL=https://dev.advancedprogramming.ovh/api

# For production, this is set by deployment config
# NUXT_PUBLIC_API_BASE_URL=https://advancedprogramming.ovh/api
```

## Development

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Linting and Type checking

This project uses ESLint for linting and Prettier for code formatting:

```bash
# Run linter
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Format all files
pnpm run format

# Check formatting
pnpm run format:check

# Type checking
pnpm run typecheck
```

## API Client

The API client is auto-generated from the OpenAPI specification and provides:

- Full TypeScript type safety
- Automatic request/response typing
- Built-in error handling
- JWT authentication integration

To regenerate after API changes:

```bash
pnpm run generate:api
```

## License

MIT
