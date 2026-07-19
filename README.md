# AI Power App

A small full-stack demo app for building and previewing web app ideas with a chat-style builder experience.

## Features

- Landing page and authentication flow
- User sign-up and login with JWT-based session handling
- Dashboard for creating and managing projects
- Builder view with prompt input, chat-style generation, live preview, and code view
- Local JSON-backed demo persistence for users and projects

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Express
- JSON Web Tokens (JWT)
- bcryptjs
- CORS

## Project Structure

- client/ - Vite React frontend
- server/ - Express backend API

## Prerequisites

- Node.js 18+
- npm

## Installation

1. Install frontend dependencies
   ```bash
   cd client
   npm install
   ```

2. Install backend dependencies
   ```bash
   cd ../server
   npm install
   ```

## Running Locally

### Start the backend
```bash
cd server
npm start
```

The API will run at:
- http://localhost:3000
- Health check: http://localhost:3000/health

### Start the frontend
```bash
cd client
npm run dev
```

The app will be available at:
- http://localhost:5173/

## Notes

- The current backend uses a local JSON-based store for demo purposes.
- The generation flow is implemented as a local demo response and can be extended with a real AI provider later.

## Useful Commands

### Frontend
```bash
cd client
npm run build
npm run dev
```

### Backend
```bash
cd server
npm start
npm run dev
```
