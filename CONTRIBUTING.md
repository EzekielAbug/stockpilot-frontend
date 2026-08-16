# Contributing to StockPilot (Frontend)

Welcome! This guide outlines how to get the StockPilot UI running locally and my conventions for writing React components.

## Local Development

The frontend is built using Vite, making the local development experience incredibly fast.

1. **Clone the repo:**
   ```bash
   git clone https://github.com/EzekielAbug/stockpilot-frontend.git
   ```

2. **Install node modules:**
   ```bash
   npm install
   ```

3. **Configure the API URL:**
   Create a `.env` file and point it to the backend. If you are running the backend locally via Docker, use:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
   If you want to connect to the live production database instead, use the Render URL.

4. **Start Vite:**
   ```bash
   npm run dev
   ```

## Coding Standards

### 1. Functional Components Only
Do not use legacy Class components. Every component should be a functional component utilizing React Hooks.

### 2. Utility-First CSS (Tailwind)
Do not create `.css` files unless absolutely necessary (e.g., configuring base layer variables). Apply styles directly via `className` using Tailwind utilities. This ensures styling remains scoped to the component and is stripped during the build process if unused.

### 3. Linting
I utilize `oxlint` for blazingly fast JavaScript linting. Before opening a Pull Request, ensure your code passes:
```bash
npm run lint
```

## Deployment Pipeline

This repository is continuously deployed to **Vercel**. 
Any push to the `main` branch will automatically trigger a production build. Vercel automatically injects the production `VITE_API_URL` environment variable during the build process.

If you are opening a Pull Request, Vercel will generate a temporary "Preview Deployment" URL so reviewers can test your changes live before merging.
