# 📝 Editable User Table – React + Tailwind

This is an editable table for users built with **React**, **Tailwind CSS**

It allows you to:

- ✅ Add new users (with name, email, and age)
- ✅ Validate user inputs (with constraints that can be modified if needed)
- ✅ Delete users with confirmation
- ✅ Undo and redo recent actions
- ✅ Beautiful and simple UI using Tailwind CSS
- ✅ Toast notifications using `sonner`

---

## ⚙️ Tech Stack

- **React (Vite)**
- **Tailwind CSS**
- **Zod** – schema validation
- **Lucide-React** – icons
- **Sonner** – toasts
- **MockApi** – using simple REST-like endpoints for user CRUD

---

## Quick Start

```bash
git clone git@github.com:ramzimah/editable-users-table.git
cd editable-users-table
npm install
cp .env.example .env  # Add the base API URL in .env file
npm run dev
```

The app is deployed on Vercel and can be accessed using this link: https://editable-users-table.vercel.app/
