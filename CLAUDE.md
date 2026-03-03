# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Knock Knock HR is a recruitment platform with three components: a .NET API backend, a Nuxt admin dashboard, and an embeddable JavaScript widget for companies to receive unsolicited job applications.

## Architecture

```
widget (vanilla JS) → POST /api/apply → Backend (.NET 10, PostgreSQL, S3, Resend)
admin (Nuxt 4/Vue 3) → GET/POST /api/* → Backend (JWT auth)
```

- **Backend** (`backend/KnockKnock.Api/`): .NET 10 minimal API with EF Core, JWT auth, S3 for CV storage, Resend for emails. Feature-based organization under `Features/` (Auth, Apply, Applicants, Tenants, Users).
- **Admin** (`admin/`): Nuxt 4 (Vue 3, TypeScript, Tailwind CSS). CSR-only (`ssr: false`). Auth state in localStorage via `useAuth()` composable. API calls via `useApi()` with automatic Bearer token injection. Global auth middleware.
- **Widget** (`widget/`): Self-contained vanilla JS bundle. Build script (`build.js`) inlines CSS, SVG icons, and WOFF2 fonts into a single `knock-knock.min.js`. Embedded via `<script>` tag with `data-endpoint` and `data-company` attributes.

## Build & Run Commands

### Local Development (start infrastructure first)
```bash
docker-compose up                    # PostgreSQL (5432) + Mailpit (SMTP: 1025, UI: 8025)
```

### Backend
```bash
cd backend/KnockKnock.Api
dotnet build
dotnet run                           # Runs on http://localhost:5118
dotnet ef migrations add <Name>      # Create migration
```

### Admin Dashboard
```bash
cd admin
npm install
npm run dev                          # http://localhost:3000, proxies /api/** to backend
npm run build                        # Production build
npm run generate                     # Static generation for Docker/nginx
```

### Widget
```bash
cd widget
npm install
npm run build                        # Runs build.js → knock-knock.min.js
```

## Key Configuration

Backend config is in `appsettings.Development.json`. Default dev credentials: `admin@knockknock.hr` / `admin123`. The backend auto-migrates and seeds the admin user on startup.

Admin Nuxt proxies `/api/**` to `http://localhost:5118/api/**` in development (configured in `nuxt.config.ts`).

## Deployment

Docker-based: `deploy/backend.Dockerfile` (multi-stage .NET), `deploy/admin.Dockerfile` (Nuxt generate + nginx). Caddy reverse proxy serves widget static files, proxies API and admin. Domain: `getknocknock.de`.

## Design System

- **Font**: Open Sans (loaded via Google Fonts in `nuxt.config.ts`)
- **Brand blue**: `#0B56CF`
- **Light blue background**: `#F1F5FF` (sidebar, table rows)
- **Tailwind config**: `admin/tailwind.config.mjs`
- **UI language**: German throughout

## Database Entities

Three main entities: **Tenant** (company with slug), **User** (admin user with role: CompanyUser/SuperAdmin, belongs to tenant), **Applicant** (job applicant with CV in S3, email confirmation token).

## Auth Model

JWT Bearer tokens. Two roles: `SuperAdmin` (manages tenants and users) and `CompanyUser` (views applicants for their tenant). localStorage keys: `kk_token`, `kk_role`, `kk_tenant_name`.
