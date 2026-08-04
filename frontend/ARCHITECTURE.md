# Aegis v5.0.0 — Frontend Architecture Blueprint

## 1. Executive Summary
Aegis v5.0.0 is an enterprise-grade AI observability and RAG faithfulness auditing workspace built with React 18, Next.js 14 App Router, TypeScript (Strict Mode), Tailwind CSS, Framer Motion, TanStack Query v5, and Zustand.

---

## 2. Directory & Folder Responsibilities

```text
frontend/src/
├── app/                  # Next.js App Router route entrypoints (pure composition)
├── components/           # UI and Dashboard component hierarchy
│   ├── ui/               # Atomic design primitives (Button, Card, Badge, Modal, Input, States)
│   ├── brand/            # Commercial logomark & schematic vector illustrations
│   ├── layout/           # Global layout containers (Sidebar, Header, CommandPalette)
│   └── dashboard/        # Dashboard workspace components
│       ├── layout/       # Workspace grid & shell containers (dashboard-shell, dashboard-grid)
│       ├── features/     # Isolated feature boundaries (reliability, analytics, investigation, history)
│       ├── overview/     # Macro health cards
│       ├── analytics/    # Visualization charts (similarity timeline, confidence histogram)
│       └── investigation/# Diagnostic workspace inspector
├── config/               # Application-level configuration & feature flags
├── contracts/            # Strict API DTO & feature interface contracts
├── data/                 # Baseline mock data & development fallbacks
├── hooks/                # Custom React hooks (UI state, keyboard shortcuts, API queries)
│   └── api/              # TanStack Query v5 API hooks
├── lib/                  # Utilities, Axios API client instance, and error handlers
├── services/             # Production API service layer (scan, dashboard, report, health)
├── store/                # Zustand global state stores (useUIStore, useFilterStore)
├── styles/               # Design system custom property tokens (tokens.css) & globals
└── types/                # Core TypeScript DTO domain types
```

---

## 3. Data Flow Architecture

```text
Backend Fast API / Python Scanner
              ↓
   Axios HTTP Client (`src/lib/api.ts` with interceptors)
              ↓
  Service Layer (`src/services/`: scan, dashboard, report, health)
              ↓
 TanStack Query v5 (`src/hooks/api/`: cached server state & mutations)
              ↓
    Zustand Stores (`src/store/`: transient client UI state & filters)
              ↓
 Feature Components (`src/components/dashboard/features/`)
              ↓
  Atomic UI Primitives (`src/components/ui/`)
```

---

## 4. State Management Roles: React Query vs. Zustand

- **TanStack Query (Server State)**:
  - Asynchronous data fetching, caching, deduplication, loading/error states, and polling.
  - Controls dashboard metrics, audit reports, single scan executions, and system health status.
- **Zustand (Client UI State)**:
  - Local client preferences, theme toggling (`light` vs `dark`), navigation sidebar collapse state, command palette visibility (`Cmd+K`), and filter state queries.

---

## 5. Feature Boundary Rules
- **Encapsulation**: Feature components inside `src/components/dashboard/features/` must remain decoupled.
- **Pure Page Composition**: `app/page.tsx` must only compose feature components and layout containers. No inline mock data or business logic is permitted in `page.tsx`.
- **API Isolation**: React components must never make direct `axios` or `fetch` calls. All HTTP requests pass through `src/services/` and `src/hooks/api/`.

---

## 6. Future Scalability Strategy
- **Step 4 (Page Views)**: Build dedicated routes (`/scan`, `/batch`, `/results`, `/reports`, `/settings`) utilizing the service layer and feature boundaries created in Step 3.
- **Step 5 (Backend Integration)**: Connect Next.js frontend to Python FastAPI endpoints seamlessly by toggling environment endpoints in `.env.local`.
