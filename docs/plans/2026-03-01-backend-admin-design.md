# Knock Knock — Backend & Admin Frontend Design

## Overview

Multi-tenant applicant management system. Companies are provisioned by Knock Knock HR staff (no self-registration). Each company gets scoped access to their applicants via an admin dashboard. Super admins manage all tenants and users.

**Tech stack**: .NET 8 Minimal API, Nuxt 3 + Tailwind CSS, PostgreSQL, Hetzner Object Storage (S3-compatible).

## Data Model

### Tenants

| Column     | Type      | Notes                              |
|------------|-----------|------------------------------------|
| id         | uuid (PK) | Generated                          |
| name       | text      | Company display name               |
| slug       | text      | Unique, matches widget `data-company` |
| is_active  | bool      | Soft disable                       |
| created_at | timestamptz |                                  |

### Users

| Column        | Type      | Notes                                  |
|---------------|-----------|----------------------------------------|
| id            | uuid (PK) | Generated                             |
| email         | text      | Unique                                |
| password_hash | text      | BCrypt                                |
| tenant_id     | uuid (FK) | Nullable — null for super_admin       |
| role          | enum      | `super_admin` or `company_user`       |
| created_at    | timestamptz |                                      |

### Applicants

| Column             | Type      | Notes                              |
|--------------------|-----------|------------------------------------|
| id                 | uuid (PK) | Generated                         |
| tenant_id          | uuid (FK) | References Tenants                |
| first_name         | text      |                                    |
| last_name          | text      |                                    |
| email              | text      |                                    |
| area_of_work       | text      |                                    |
| linkedin_url       | text      | Nullable                           |
| cv_storage_key     | text      | Nullable, S3 object key            |
| email_confirmed    | bool      | Default false                      |
| confirmation_token | text      | Nullable, random token             |
| created_at         | timestamptz |                                  |

## API Endpoints

### Public (no auth)

| Method | Route                 | Purpose                              |
|--------|-----------------------|--------------------------------------|
| POST   | /api/apply            | Widget submission (multipart/form-data) |
| GET    | /api/confirm/{token}  | Email confirmation link              |
| POST   | /api/auth/login       | Email + password -> JWT              |

### Admin (JWT required)

| Method | Route                      | Role                     | Purpose                        |
|--------|----------------------------|--------------------------|--------------------------------|
| GET    | /api/applicants            | company_user, super_admin | List applicants (tenant-scoped) |
| GET    | /api/applicants/{id}/cv    | company_user, super_admin | Presigned S3 URL for CV        |
| GET    | /api/tenants               | super_admin              | List tenants                   |
| POST   | /api/tenants               | super_admin              | Create tenant                  |
| PUT    | /api/tenants/{id}          | super_admin              | Update tenant                  |
| GET    | /api/users                 | super_admin              | List users                     |
| POST   | /api/users                 | super_admin              | Create user (assign to tenant) |

### Widget POST fields (English names)

- `first_name`, `last_name`, `email`, `area_of_work`, `linkedin_url`, `cv`, `tenant`

## Email Confirmation Flow

1. Widget submits to `POST /api/apply`
2. Backend saves applicant with `email_confirmed = false`, generates random `confirmation_token`
3. Backend sends email with link: `https://<domain>/api/confirm/{token}`
4. Applicant clicks link -> backend sets `email_confirmed = true`, redirects to "Danke" page
5. Admin dashboard shows visual indicator for unconfirmed applicants

## Admin Frontend (Nuxt 3)

### Pages

| Route         | Role                     | Content                          |
|---------------|--------------------------|----------------------------------|
| /login        | public                   | Email + password form            |
| /applicants   | company_user, super_admin | Applicant list grouped by month |
| /tenants      | super_admin              | Tenant list + create/edit        |
| /users        | super_admin              | User list + create               |

### Layout

- Sidebar: logo, tagline, nav links (role-dependent), logout, "Powered by Knock Knock HR"
- Main area: table views matching the existing screenshot design

### Auth

- JWT stored in httpOnly cookie
- Nuxt middleware checks auth on every route, redirects to /login if expired
- Tenant scoping: JWT claims include tenant_id, backend middleware enforces scoping

## Project Structure

```
knock-knock/
  widget/                  # existing
  backend/
    KnockKnock.Api/
      Program.cs
      Features/
        Apply/
        Auth/
        Applicants/
        Tenants/
        Users/
      Data/
        AppDbContext.cs
        Migrations/
      Services/
        EmailService.cs
        StorageService.cs
      KnockKnock.Api.csproj
  admin/
    nuxt.config.ts
    pages/
      login.vue
      applicants.vue
      tenants.vue
      users.vue
    layouts/
      default.vue
    composables/
      useAuth.ts
      useApi.ts
    middleware/
      auth.ts
  docker-compose.yml
```

## Deployment

- Hetzner Cloud VPS running Docker
- docker-compose: Postgres, .NET backend, Nuxt app
- Hetzner Object Storage for CV files
- Reverse proxy (Caddy or Traefik) for HTTPS
- Email via MailKit + SMTP (Mailjet, Postmark, or Hetzner SMTP)

## Key Packages

**Backend**: EF Core + Npgsql, AWSSDK.S3, MailKit, BCrypt.Net
**Admin**: Nuxt 3, Tailwind CSS, @nuxtjs/tailwindcss
