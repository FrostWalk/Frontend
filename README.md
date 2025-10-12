# Advanced programming - Frontend Application

A comprehensive Nuxt 4 frontend application for managing student projects, groups, and deliverables.

## Features

### Student Interface

- Account registration with email confirmation
- Project browsing and enrollment
- Group creation and management
- Group and individual deliverable selection
- Real-time project tracking

### Admin Interface

- Admin authentication and role-based access (Root, Professor, Coordinator)
- Project creation and management
- Deliverable and component configuration
- Security code generation for group creation
- Admin user management
- Group monitoring and oversight

## Tech Stack

- **Framework**: Nuxt 4.1.3
- **UI Library**: NuxtUI 4.0.1 (built on Tailwind CSS)
- **Icons**: @nuxt/icon with Material Symbols
- **API Client**: Auto-generated from OpenAPI spec using @hey-api/openapi-ts
- **Package Manager**: pnpm

## Setup

### Prerequisites

- Node.js 18+ or 20+
- pnpm 10+

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

### Code Quality

This project uses ESLint for linting and Prettier for code formatting:

```bash
# Run linter
pnpm run lint

# Auto-fix linting issues
pnpm run lint:fix

# Format all files
pnpm run format

# Check formatting (useful for CI)
pnpm run format:check

# Type checking
pnpm run typecheck
```

See [LINTING_AND_FORMATTING.md](./LINTING_AND_FORMATTING.md) for detailed information about code quality tools.

## Production Build

Build the application for production:

```bash
pnpm build
```

Preview production build locally:

```bash
pnpm preview
```

## Deployment

### Environment Configuration

Set the `NUXT_PUBLIC_API_BASE_URL` environment variable based on your deployment environment:

#### Development Deployment

```bash
export NUXT_PUBLIC_API_BASE_URL=https://dev.advancedprogramming.ovh/api
pnpm build
```

Frontend accessible at: `https://dev.advancedprogramming.ovh/`

#### Production Deployment

```bash
export NUXT_PUBLIC_API_BASE_URL=https://advancedprogramming.ovh/api
pnpm build
```

Frontend accessible at: `https://advancedprogramming.ovh/`

### Docker Example

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

# Set API URL for build
ENV NUXT_PUBLIC_API_BASE_URL=https://advancedprogramming.ovh/api

RUN pnpm run generate:api
RUN pnpm build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

## Project Structure

```
app/
├── layouts/
│   ├── default.vue       # Student layout with navigation
│   ├── admin.vue         # Admin layout with role-based menu
│   └── auth.vue          # Minimal layout for login/register
├── pages/
│   ├── index.vue         # Landing page with redirect logic
│   ├── login.vue         # Student login
│   ├── register.vue      # Student registration
│   ├── confirm.vue       # Email confirmation
│   ├── projects/         # Student project pages
│   ├── groups/           # Group management pages
│   └── admin/            # Admin interface
│       ├── login.vue     # Admin login
│       ├── projects/     # Project management
│       ├── users/        # Admin user management
│       ├── security-codes/ # Security code management
│       └── groups/       # Group oversight
├── middleware/
│   ├── auth.ts           # Student authentication guard
│   └── admin-auth.ts     # Admin authentication guard
└── components/           # Reusable Vue components

composables/
├── api/                  # Generated API client (gitignored)
├── useApi.ts             # API client wrapper with auth
└── useAuth.ts            # Authentication state management
```

## Key Composables

### `useApi()`

Provides configured API client with automatic JWT token injection.

### `useStudentAuth()`

Manages student authentication state:

- `login(credentials)` - Authenticate student
- `logout()` - Clear session
- `isAuthenticated` - Auth status
- `user` - Current user data

### `useAdminAuth()`

Manages admin authentication state with role support:

- `login(credentials)` - Authenticate admin
- `logout()` - Clear session
- `hasRole(roleId)` - Check admin role
- `roles` - Role constants (ROOT, PROFESSOR, COORDINATOR)

## Routes

### Public Routes

- `/` - Landing page
- `/login` - Student login
- `/register` - Student registration
- `/confirm?t={token}` - Email confirmation
- `/admin/login` - Admin login

### Student Routes (Protected)

- `/projects` - View enrolled projects
- `/groups/create` - Create new group
- `/groups/[id]` - Group details and management
- `/groups/[id]/select-deliverable` - Select group deliverable
- `/projects/[id]/select-deliverable` - Select individual deliverable

### Admin Routes (Protected)

- `/admin/projects` - Project list
- `/admin/projects/create` - Create new project
- `/admin/projects/[id]` - Project details with tabs
- `/admin/projects/[id]/setup` - Setup wizard for deliverables
- `/admin/users` - Admin user management
- `/admin/users/create` - Create admin user
- `/admin/security-codes` - Security code list
- `/admin/security-codes/create` - Generate security code
- `/admin/groups/[id]` - Group details (admin view)

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

## Development Tips

1. **API Updates**: Run `pnpm run generate:api` whenever the backend API changes
2. **Environment Variables**: Always restart dev server after changing `.env`
3. **Type Safety**: The generated API client provides full type checking
4. **Icons**: Browse Material Symbols at https://fonts.google.com/icons
5. **UI Components**: Refer to NuxtUI documentation at https://ui.nuxt.com

## License

MIT
