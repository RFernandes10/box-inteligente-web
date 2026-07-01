<p align="center">
  <img src="https://img.shields.io/badge/status-production%20live-22c55e?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/react-18.3-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/vite-5.4-646CFF?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/typescript-5.6-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind">
</p>

<h1 align="center">🍪 Box-Inteligente Web</h1>
<p align="center"><strong>React SPA — Inventory Management Dashboard</strong></p>
<p align="center">
  <a href="https://box-inteligente-web.vercel.app">🌐 Live App</a> &nbsp;|&nbsp;
  <a href="https://github.com/RFernandes10/box-inteligente-api">⚙️ Backend API</a>
</p>

---

## 📋 Overview

Modern single-page application for managing inventory, stock movements, and business intelligence reports. Built with **React 18**, **TypeScript**, and **TailwindCSS** — featuring a responsive dashboard with real-time charts, dark mode, and role-based navigation.

### Pages

```
/login          Login page
/               Dashboard — charts, low-stock alerts, expiring products
/products       Product listing with search & pagination
/products/new   Create product form
/products/:id   Product detail
/brands         Brand management
/categories     Category management
/suppliers      Supplier management
/movements      Stock movement register & history
/reports        PDF / Excel / CSV report export
/settings       User management (Admin only)
```

---

## ⚡ Key Features

### UI/UX
| Feature | Detail |
|---------|--------|
| **Dark/Light Theme** | System-aware with manual toggle, persisted to localStorage |
| **Responsive Layout** | Collapsible sidebar, mobile-friendly |
| **Role-based UI** | Navigation and actions filtered by user role |
| **Loading States** | React Query's built-in loading/skeleton states |
| **Toast Notifications** | Success/error feedback via react-toastify |

### Data Management
| Feature | Detail |
|---------|--------|
| **Server State** | TanStack Query for caching, refetching, and pagination |
| **Client State** | Zustand for auth state (token, user, theme) |
| **Auto-refresh** | Token rotation via Axios interceptor |
| **Optimistic UI** | Instant feedback on mutations |

### Forms & Validation
| Feature | Detail |
|---------|--------|
| **React Hook Form** | Performant forms with minimal re-renders |
| **Zod Schemas** | Shared validation between client and server |
| **File Upload** | Drag-and-drop with react-dropzone + preview |
| **Search** | Debounced input (300ms) for product/brand search |

### Charts & Reports
- **Chart.js** line chart for entry/exit movement history
- Dashboard summary cards (total products, low stock, alerts)
- **PDF** generation (inventory, movements, low-stock)
- **Excel** (.xlsx) and **CSV** export

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18 + TypeScript 5.6 | Component-based SPA |
| **Bundler** | Vite 5.4 | Fast dev server & optimized builds |
| **Routing** | React Router v6 | Client-side navigation |
| **Server State** | TanStack Query 5 | API data caching & sync |
| **Client State** | Zustand 5 | Auth & theme management |
| **HTTP Client** | Axios 1.7 | API communication with interceptors |
| **Styling** | TailwindCSS 3.4 + Radix UI | Utility-first + accessible components |
| **Forms** | React Hook Form 7 + Zod 3 | Type-safe form validation |
| **Charts** | Chart.js 4 + react-chartjs-2 | Dashboard visualizations |
| **Icons** | Lucide React | Consistent icon set |
| **Notifications** | react-toastify | User feedback toasts |
| **File Upload** | react-dropzone | Drag-and-drop image upload |

---

## 🚀 Getting Started

```bash
# Clone
git clone https://github.com/RFernandes10/box-inteligente-web.git
cd box-inteligente-web

# Install
npm install

# Run (dev mode with API proxy)
npm run dev    # http://localhost:5173
```

The dev server proxies `/api` requests to `http://localhost:3333` (configured in `vite.config.ts`).

### Production Build

```bash
npm run build           # Outputs to dist/
```

For production, set `VITE_API_URL` env var to your API endpoint.

---

## 🔌 Architecture

### Data Flow
```
┌──────────┐    Axios + JWT     ┌───────────┐    Prisma    ┌──────────┐
│  React   │──────────────────▶│  Express  │─────────────▶│PostgreSQL│
│  SPA     │◀──────────────────│   API     │◀─────────────│          │
│ Vercel   │   JSON Response   │  Render   │              │  Neon    │
└──────────┘                   └───────────┘              └──────────┘
     │                              │
     ▼                              ▼
 Zustand (Auth)              TanStack Query
 localStorage (Theme)        (Server cache)
```

### Component Structure
```
src/
├── components/
│   ├── layout/       Header, Sidebar, ProtectedRoute
│   └── ui/           button, card, input, label (shadcn-style)
├── pages/            Login, Dashboard, Products, Brands, ...
├── services/         Axios instance with auth interceptor
├── stores/           Zustand auth store
├── types/            TypeScript interfaces
└── utils/            cn() helper, unit formatters
```

---

## 📦 Deployment

| Service | Tier | URL |
|---------|------|-----|
| **Frontend** | Vercel (Hobby) | [box-inteligente-web.vercel.app](https://box-inteligente-web.vercel.app) |
| **API** | Render (Free) | [box-inteligente-api-rf.onrender.com](https://box-inteligente-api-rf.onrender.com/health) |

Deploys are automatic on every push to the `main` branch via GitHub integration.

---

## 📄 License

MIT &mdash; feel free to use as a reference or portfolio project.
