# StockPilot UI

> A B2B Inventory POS and Dashboard built with React, Vite, and Tailwind CSS.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

> **👉 Looking for the Backend Architecture?**  
> This repository contains the Frontend UI. The Python/FastAPI Backend engine and Database schema can be found [here](https://github.com/EzekielAbug/stockpilot).

## Live Demo

The application is deployed on Vercel's Edge Network.
**Production URL:** [https://stockpilot-webinv.vercel.app](https://stockpilot-webinv.vercel.app)

*Note: You can register a free account to test the multi-tenant isolation, or explore the interface yourself!*

## Overview

StockPilot UI is a fast, single-page application (SPA). It gives B2B organizations a clean interface to manage their wholesale vendors, retail customers, product catalogs, and inventory.

The main feature of the UI is the **Point of Sale (POS)** and **Order Management** system. It allows cashiers to quickly add items to a cart, calculate totals, and send sales orders to the backend instantly.

### What does StockPilot do?

StockPilot is a full-stack SaaS platform designed to help distribution businesses run their daily operations. Its core features include:
*   **Point of Sale (POS):** A fast interface for cashiers to ring up sales and instantly deduct inventory.
*   **Multi-Tenant Workspaces:** Complete data isolation. Multiple companies can use the platform at the same time without ever seeing each other's data.
*   **B2B Relationship Management:** Easily track wholesale Suppliers (who you buy from) and retail Customers (who you sell to).
*   **Safe Data Deletion:** I use "Soft Deletes" to ensure that even if a product is discontinued, historical invoices and past orders are never broken.

## Quick Start (Local Development)

The frontend is built with Vite for incredibly fast Hot Module Replacement (HMR).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/EzekielAbug/stockpilot-frontend.git
   cd stockpilot-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory pointing to your local backend (or the live Render backend):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Authentication & API Integration

The frontend uses Axios intercepts to handle authentication seamlessly. 
*   **JWT Credentials:** I use `withCredentials: true` globally on my Axios instance. The backend issues HTTP-only cookies, meaning my React code never has to manually store or attach vulnerable Access Tokens in `localStorage`.
*   **Global Error Handling:** If the backend returns a `401 Unauthorized` (e.g., the session expired), the Axios interceptor automatically catches it, clears the local user state, and redirects the user back to `/login` without requiring individual components to handle authentication errors.

## Documentation Index

To understand how the React component tree is structured and how state is managed, please review:

*   **[Frontend Architecture](docs/ARCHITECTURE.md)**: Details on the component hierarchy, routing, and data fetching strategies.
*   **[Contributing Guide](CONTRIBUTING.md)**: Rules for writing UI components and linting standards.

---
*UI crafted by Ezekiel Abug.*
