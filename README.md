# YOJNA — Agile Project Management Platform (Jira Clone)

A modern, full-stack Jira clone built with Next.js 14 (App Router), Clerk Multi-Tenant Organizations, Neon PostgreSQL, Prisma ORM, Tailwind CSS, and shadcn/ui.

---

## 📁 Complete Project & Routing Architecture

The project follows the Next.js 14 App Router conventions. Below is the complete directory structure and the purpose of every folder and file.

```text
jira-app/
├── actions/                               # Server Actions (Mutations & DB Queries)
│   └── organization.js                    # Server actions for projects & user issues
│
├── app/                                   # Next.js App Router Directory
│   ├── (auth)/                            # Route Group: Authentication (Clerk)
│   │   ├── layout.jsx                     # Centered flex container for auth screens
│   │   ├── sign-in/[[...sign-in]]/        # Catch-all route for Clerk Sign-In
│   │   │   └── page.jsx
│   │   └── sign-up/[[...sign-up]]/        # Catch-all route for Clerk Sign-Up
│   │       └── page.jsx
│   │
│   ├── (main)/                            # Route Group: Authenticated App Dashboard
│   │   ├── layout.js                      # Shared main layout (container mx-auto mt-5 px-4)
│   │   │
│   │   ├── onboarding/                    # Onboarding Flow
│   │   │   └── [[...onboarding]]/
│   │   │       └── page.jsx               # Clerk OrganizationList (select / create workspace)
│   │   │
│   │   ├── organization/                  # Organization Workspace Routing
│   │   │   └── [orgId]/                   # Dynamic route for active organization
│   │   │       ├── _components/           # Private folder: co-located org components
│   │   │       │   ├── org-switcher.jsx   # Organization selector / switcher
│   │   │       │   ├── project-list.jsx   # Grid of projects in this organization
│   │   │       │   └── user-issues.jsx    # Assigned & reported issues breakdown
│   │   │       └── page.jsx               # Organization Dashboard Page
│   │   │
│   │   └── project/                       # Project & Sprint Board Routing
│   │       ├── _components/               # Private folder: shared project components
│   │       ├── create/                    # Create Project route (/project/create)
│   │       │   └── page.jsx               # Project creation form page
│   │       └── [projectId]/               # Dynamic route for specific project board
│   │           ├── _components/           # Private folder: sprint board & issue components
│   │           └── page.jsx               # Kanban Board & Sprint Management Page
│   │
│   ├── favicon.ico                        # App Favicon
│   ├── globals.css                        # CSS Variables, Dark theme, and Tailwind base styles
│   ├── layout.js                          # Root Layout (ClerkProvider, ThemeProvider, Header, checkUser)
│   └── page.js                            # Marketing Landing Page (Hero, Features, Testimonials)
│
├── components/                            # Global Reusable Components
│   ├── ui/                                # shadcn/ui primitives (button, card, dialog, tabs, etc.)
│   ├── company-carousel.jsx               # Social proof company logos carousel
│   ├── header.jsx                         # Main navbar with Clerk OrganizationSwitcher & UserButton
│   ├── logo.jsx                           # Application logo component
│   └── theme-provider.jsx                 # NextThemes provider for Dark/Light mode
│
├── lib/                                   # Shared Utilities & Server Helpers
│   ├── checkUser.js                       # Auto-sync Clerk logged-in user to Prisma DB
│   ├── prisma.js                          # PrismaClient singleton instance
│   └── utils.js                           # Tailwind class merging helper (cn function)
│
├── prisma/
│   └── schema.prisma                      # Database schema & models (User, Project, Sprint, Issue)
│
├── public/                                # Static SVG and image assets
├── middleware.js                          # Clerk Route Protection & Redirection Logic
├── package.json                           # Dependencies and project scripts
└── tailwind.config.js                     # Tailwind CSS theme & plugin configurations
```

---

## 🧭 Next.js Routing Conventions Explained

| Pattern | Example | Why It's Used |
| :--- | :--- | :--- |
| **Route Groups `(...)`** | `(auth)`, `(main)` | Groups related routes to share layouts **without adding extra segments to the browser URL**. (e.g. `app/(main)/onboarding` → `/onboarding`). |
| **Private Folders `_...`** | `_components` | Next.js router completely ignores folders starting with an underscore. Ideal for co-locating page-specific components right next to the page. |
| **Dynamic Segments `[...]`** | `[orgId]`, `[projectId]` | Extracts URL path parameters (e.g. `/organization/org_123` assigns `"org_123"` to `params.orgId`). |
| **Catch-All `[[...name]]`** | `[[...onboarding]]` | Matches all nested paths under that route, essential for Clerk's multi-step authentication and organization flows. |

---

## 🗄️ Database Models (`prisma/schema.prisma`)

* **`User`**: Synchronized from Clerk (`clerkUserId`, `email`, `name`, `imageUrl`). Connects to reported and assigned issues.
* **`Project`**: Belongs to an organization (`organizationId`). Holds `name`, `key`, and description. Contains `sprints` and `issues`.
* **`Sprint`**: Sprints within a project with statuses: `PLANNED`, `ACTIVE`, `COMPLETED`.
* **`Issue`**: Project tickets with statuses (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`) and priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).

---

## 🚀 Running the Project

```bash
# Navigate to the app directory
cd jira-app

# Install dependencies
npm install

# Run database migrations / push schema
npx prisma db push

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
