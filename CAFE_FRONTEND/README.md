# CAFE Frontend - Brew Haven Dashboard

React + TypeScript + Vite frontend for the CAFE (Cafe Management) fullstack application. Features a modern, warm design for cafe management operations.

## Features

- **Dashboard** - Overview of key metrics and operations
- **Branch Management** - Manage multiple cafe locations
- **Employee Management** - Track staff and assignments
- **Customer Management** - Manage customer database
- **Menu Management** - Create and manage menu items
- **Order Management** - View and manage customer orders
- **Payment Management** - Process and track payments
- **Feedback Management** - Collect and review customer feedback
- **Inventory Management** - Track stock levels
- **Protected Routes** - Authentication-based access control
- **Responsive Design** - Works on desktop and mobile

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `.env` with your backend URL:
     ```
     VITE_API_URL=http://localhost:5000
     VITE_APP_NAME=Brew Haven
     ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Build

```bash
npm run build
```

Output will be in the `dist/` directory.

## Preview Build

```bash
npm run preview
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Motion** - Animations

## Architecture

```
src/
├── pages/          # Route pages
├── components/     # Reusable components
├── layouts/        # Layout components
├── services/       # API services and utilities
├── types/          # TypeScript interfaces
├── utils/          # Helper functions
└── index.css       # Global styles
```

## Authentication

The frontend uses local storage to persist user sessions. Login credentials are validated against the backend API at `POST /login`.

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:5000)
- `VITE_APP_NAME` - Application name (default: Brew Haven)

## Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Type check with TypeScript
- `npm run clean` - Remove dist directory
