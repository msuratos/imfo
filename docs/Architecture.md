# Architecture

Overview

The app follows a simple two-tier architecture:

- Client: React (Vite) SPA served separately in dev and built/served by ASP.NET in production.
- Server: ASP.NET Core Web API exposing REST endpoints for budgets, categories, and transactions.

Diagram (ASCII)

```
+-------------+        HTTP/REST         +------------------+
|   Browser   | <----------------------> | ASP.NET Core API |
| (React SPA) |        /api/*            | (Controllers)    |
+-------------+                          +------------------+
       |                                        |
       | dev: Vite (port 5173)                  | data: in-memory for demo
       |                                        |
       v                                        v
   imfo.react                               Imfo.WebApi

```

Notes
- The server uses an in-memory repository for demo. Replace with EF Core / SQL for production.
