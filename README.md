# Canvas Companions

Canvas Companions is a real-time collaborative drawing web application that allows multiple users to draw together on a shared canvas. The application focuses on fast synchronization, live user presence, and a clean, intuitive drawing experience directly in the browser.

---

## Features

- Real-time collaborative drawing
- Shared canvas synchronized across all connected users
- Live cursor tracking for each participant
- User presence with unique names and colors
- Drawing tools:
  - Freehand drawing
  - Eraser
  - Undo / Redo
  - Clear canvas
- Responsive layout for different screen sizes
- Lightweight and performant client-side rendering

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Styling & UI
- Tailwind CSS
- Component-based UI architecture

### Realtime Communication
- Supabase Realtime

### Tooling
- ESLint
- Vitest

---

## Project Structure

```

src/
├── components/
│   ├── canvas/        # Canvas rendering, tools, cursors, user list
│   └── ui/            # Reusable UI components
├── hooks/             # Custom hooks for drawing and realtime sync
├── integrations/
│   └── supabase/      # Supabase client and realtime channels
├── pages/             # Application pages
├── types/             # Shared TypeScript types
├── lib/               # Utility functions
├── main.tsx           # Application entry point
├── App.tsx            # Root component

````

---

## How It Works

- Each user joining the application is assigned a unique identifier, display name, and color.
- Drawing actions are captured locally and broadcast in real time using WebSocket-based channels.
- All connected clients apply updates immediately to maintain a synchronized canvas state.
- Cursor positions are shared to show live movement of other users on the canvas.
- Undo, redo, and clear actions are synchronized across all participants.

---

## Installation & Setup

### Prerequisites
- Node.js (v18 or later recommended)
- npm

### Clone the repository
```bash
git clone https://github.com/your-username/canvas-companions.git
cd canvas-companions
````

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and add:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Start the development server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run test      # Run tests (if configured)
```

---

## Design Decisions

* Real-time communication optimized for low latency
* Separation of canvas logic from UI components
* Type-safe implementation using TypeScript
* Modular custom hooks to manage drawing and synchronization
* Minimal backend complexity for easier scalability

---

## Limitations

* No authentication or persistent user accounts
* Single shared canvas session
* Canvas state is not persisted across reloads
* No export functionality

---

## Future Improvements

* User authentication and profiles
* Multiple rooms or session-based canvases
* Shape, text, and selection tools
* Export canvas as image or SVG
* Persistent canvas storage

---
