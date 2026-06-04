# Architecture

Overview

The app follows a simple two-tier architecture:

- Client: React (Vite) SPA served separately in dev and built/served by ASP.NET in production.
- Server: ASP.NET Core Web API exposing REST endpoints for budgets, categories, and transactions.

Mermaid: Code architecture

```mermaid
flowchart TB
  Browser["Browser (React SPA)"]
  Vite["Vite Dev Server (port 5173)"]
  API["ASP.NET Core API (Controllers)"]
  Services["Services / Business Logic"]
  Repos["Repositories"]
  InMemory[(In-memory store)]
  EFCore[(EF Core + SQL)]

  Browser -->|"dev: served by Vite"| Vite
  Vite -->|"proxy /api/*"| API
  Browser -->|"prod: static assets"| API

  API --> Services
  Services --> Repos
  Repos -->|"demo"| InMemory
  Repos -->|"production"| EFCore
```

Mermaid: Infrastructure architecture (dev vs prod)

```mermaid
flowchart TB
  subgraph Development [Development - local]
    direction TB
    BrowserDev["Browser"]
    ViteDev["Vite (dev)"]
    ASPDev["ASP.NET Core (Kestrel) - local"]
    InMemoryDev[(In-memory)]
  end

  subgraph Production [Production]
    direction TB
    BrowserProd["Browser"]
    CDN["CDN (optional)"]
    LB["Load Balancer / Reverse Proxy (Nginx / IIS / Azure Front Door)"]
    AppSvc["Hosting (App Service / Docker / VM)\nASP.NET Core App"]
    Blob["Blob / Object Storage (optional)"]
    SQL["SQL Database (Azure SQL / SQL Server)"]
  end

  BrowserDev --> ViteDev
  ViteDev --> ASPDev
  ASPDev --> InMemoryDev

  BrowserProd --> CDN
  CDN --> LB
  LB --> AppSvc
  AppSvc --> SQL
  AppSvc --> Blob

  %% Notes can be added as plain text below the diagram
```

Notes
- The server uses an in-memory repository for demo. Replace with EF Core / SQL for production.
