# Imfo — Personal Finance (Web)

Imfo (Is my finances okay?) is a small personal finance and budgeting web application. It includes an ASP.NET Core Web API backend and a React frontend placed under `src/`.

## Purpose
- Track budget items, categories, and simple totals.
- Demonstrates a hosted React + Web API layout similar to the dotnet react template.

## Quick start (CLI / Visual Studio)

1) Start the backend API

```powershell
cd src/Imfo.WebApi
dotnet restore
dotnet run
```

2) Press 'F5' in Visual Studio

Notes
- The API exposes a simple REST endpoint at `/api/budgets`.
- The React client runs on Vite in dev and talks to the API via CORS.

## Architecture

[Architecture](./docs/architecture.md)