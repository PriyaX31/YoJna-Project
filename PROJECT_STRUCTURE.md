# Project & Routing Architecture Reference

This reference file documents the exact directory layout, naming rules, and routing structure of the project.

```text
jira-app/
├── actions/
│   └── organization.js                    # Server actions (getProjects, getUserIssues)
│
├── app/
│   ├── (auth)/                            # Route Group for Authentication
│   │   ├── layout.jsx                     # Auth layout
│   │   ├── sign-in/[[...sign-in]]/page.jsx
│   │   └── sign-up/[[...sign-up]]/page.jsx
│   │
│   ├── (main)/                            # Route Group for App Dashboard
│   │   ├── layout.js                      # Main container layout
│   │   │
│   │   ├── onboarding/
│   │   │   └── [[...onboarding]]/
│   │   │       └── page.jsx               # Clerk OrganizationList / Onboarding flow
│   │   │
│   │   ├── organization/
│   │   │   └── [orgId]/
│   │   │       ├── _components/           # Private components for Org Dashboard
│   │   │       │   ├── org-switcher.jsx
│   │   │       │   ├── project-list.jsx
│   │   │       │   └── user-issues.jsx
│   │   │       └── page.jsx               # Organization Dashboard (/organization/:orgId)
│   │   │
│   │   └── project/
│   │       ├── _components/               # Shared project UI components
│   │       ├── create/
│   │       │   └── page.jsx               # Create Project Form (/project/create)
│   │       └── [projectId]/
│   │           ├── _components/           # Kanban board & sprint components
│   │           └── page.jsx               # Project Kanban Board (/project/:projectId)
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js                          # Root Layout (ClerkProvider, Theme, Header, checkUser)
│   └── page.js                            # Marketing Landing Page
│
├── components/
│   ├── ui/                                # shadcn/ui components
│   ├── company-carousel.jsx
│   ├── header.jsx
│   ├── logo.jsx
│   └── theme-provider.jsx
│
├── lib/
│   ├── checkUser.js                       # Sync Clerk user to Prisma DB
│   ├── prisma.js                          # Prisma singleton
│   └── utils.js                           # Tailwind class merging utility
│
├── prisma/
│   └── schema.prisma                      # Neon PostgreSQL schema
│
├── middleware.js                          # Clerk protected route logic
└── package.json
```

## Quick Routing Rules
1. **Never nest `organization` or `project` inside `onboarding`**. They are sibling routes directly under `(main)`.
2. **Use American spelling**: `organization` (with a `z`), matching Clerk and Prisma schemas.
3. **Use singular `project`**: The route is `/project`, not `/projects`.
4. **Use `_components` for private components**: Folders with leading underscores are ignored by the Next.js router.
