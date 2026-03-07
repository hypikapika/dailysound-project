# DailySound 🛢️
**Oil Inventory & Daily Sounding Control System**

A full-featured web app for managing oil tank soundings, cargo in/out operations, and stock control with role-based access control (RBAC).

---

## Features
- **Daily Sounding** — Morning (07:00) & Afternoon (19:00) sessions
- **Cargo In / Out** — Record vessel cargo movements with B/L reference
- **Stock Control** — Opening stock, cargo movement, actual stock, closing stock
- **Approval Workflow** — User → Supervisor → Manager
- **Reports** — Stock levels, sounding history, cargo volume analytics
- **RBAC** — Admin, Manager, Supervisor, User roles

## Demo Accounts
| Role | Username | Password |
|------|----------|----------|
| Admin | 
| Manager |
| Supervisor |
| User |

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Framework: **Vite** (auto-detected)
5. Click **Deploy** — done!

---

Built with React + Vite
