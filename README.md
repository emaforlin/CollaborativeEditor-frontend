# Collaborative Editor - Frontend

A modern, real-time collaborative document editor built with React Router, TypeScript, and TailwindCSS.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## 🚀 Features

- 🔐 **Authentication System** - JWT-based authentication with secure token management
- 📝 **Document Management** - Create, read, update, and delete collaborative documents
- 🔄 **Real-time Collaboration** - WebSocket-based real-time editing (in progress)
- 🔒 **TypeScript** - Full type safety across the application
---

## 📁 Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Modal, etc.)
│   ├── DocumentItem.tsx
│   ├── DocumentList.tsx
│   ├── NavBar.tsx
│   └── ProtectedRoute.tsx
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   └── DocumentContext.tsx
├── layouts/            # Layout components for route nesting
│   └── authenticated-layout.tsx
├── routes/             # Route components
│   ├── dashboard.tsx
│   ├── editor.tsx
│   ├── login.tsx
│   └── not_found.tsx
├── lib/                # Utility functions and clients
│   ├── auth.ts
│   ├── logger.ts
│   └── utils.ts
├── hooks/              # Custom React hooks
│   └── useAppStage.ts
├── root.tsx            # Root layout with global providers
├── routes.ts           # Route configuration
└── app.css             # Global styles
```

---

## 🏗️ Architecture

### Route Structure with Nested Layouts

The application uses a hierarchical routing structure with nested layouts to efficiently manage context providers:

```
root.tsx (AuthProvider)
├── login (public route)
├── authenticated-layout.tsx (DocumentContextProvider)
│   ├── / (dashboard - index route)
│   └── editor/:documentID
└── * (404 - not found)
```

**Key Benefits:**
- ✅ Providers are mounted once for all child routes
- ✅ Clear separation between public and authenticated routes
- ✅ Easy to extend with new authenticated routes
- ✅ Prevents "hook used outside provider" errors

### Context Hierarchy

```tsx
AuthProvider (root.tsx)
  └── DocumentContextProvider (authenticated-layout.tsx)
      └── Routes (Dashboard, Editor)
          └── Can use both AuthContext and DocumentContext
```

---

## 🔑 Context Management

### AuthContext

Located in `app/context/AuthContext.tsx`

**Provides:**
- `user: JWTPayload | null` - Current authenticated user
- `token: string | null` - JWT authentication token
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state during initialization
- `login(credentials)` - Login function
- `logout()` - Logout function
- `validateToken()` - Token validation function

**Usage:**
```tsx
import { useAuthContext } from "@/context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthContext();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### DocumentContext

Located in `app/context/DocumentContext.tsx`

**Provides:**
- `documents: Document[]` - List of user's documents
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message if any
- `createDocument(title)` - Create a new document
- `updateDocument(id, updates)` - Update a document
- `deleteDocument(id)` - Delete a document
- `fetchDocuments()` - Fetch all documents
- `refreshDocuments()` - Refresh document list

**Usage:**
```tsx
import { useDocumentContext } from "@/context/DocumentContext";

function MyComponent() {
  const { documents, createDocument, isLoading } = useDocumentContext();
  
  const handleCreate = async () => {
    const newDoc = await createDocument("My New Document");
    console.log("Created:", newDoc);
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <button onClick={handleCreate}>Create Document</button>
      {documents.map(doc => <div key={doc.id}>{doc.title}</div>)}
    </div>
  );
}
```

---

## 🛣️ Adding New Routes

### Adding a Public Route

Edit `app/routes.ts`:

```typescript
export default [
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"), // New public route
  
  layout("layouts/authenticated-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("editor/:documentID", "routes/editor.tsx"),
  ]),
  
  route("*", "routes/not_found.tsx"),
] satisfies RouteConfig;
```

### Adding an Authenticated Route

Authenticated routes automatically have access to both `AuthContext` and `DocumentContext`:

```typescript
export default [
  route("login", "routes/login.tsx"),
  
  layout("layouts/authenticated-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("editor/:documentID", "routes/editor.tsx"),
    route("settings", "routes/settings.tsx"), // New authenticated route
  ]),
  
  route("*", "routes/not_found.tsx"),
] satisfies RouteConfig;
```

Then create `app/routes/settings.tsx`:

```tsx
import { useAuthContext } from "@/context/AuthContext";
import { useDocumentContext } from "@/context/DocumentContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Settings() {
  const { user } = useAuthContext();
  const { documents } = useDocumentContext();
  
  return (
    <ProtectedRoute>
      <div>
        <h1>Settings for {user?.name}</h1>
        <p>You have {documents.length} documents</p>
      </div>
    </ProtectedRoute>
  );
}
```

---

## 🎨 UI Components

### Modal Component

Located in `app/components/ui/modal.tsx`

**Features:**
- Backdrop with blur effect
- Click outside to close
- ESC key to close
- Prevents body scroll when open
- Smooth animations

**Usage:**
```tsx
import { Modal } from "@/components/ui/modal";
import { useState } from "react";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="My Modal Title"
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

### Other UI Components

- **Button** - `app/components/ui/button.tsx`
- **Input** - `app/components/ui/input.tsx`
- **Card** - `app/components/ui/card.tsx`
- **Field** - `app/components/ui/field.tsx` (Form fields with validation)

---

## 🔧 Adding a New Context Provider

### 1. Create the Context

Create `app/context/MyContext.tsx`:

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface MyContextType {
  value: string;
  setValue: (value: string) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export function MyContextProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState("");
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within MyContextProvider");
  }
  return context;
}
```

### 2. Add to Layout

**Option A: Global (all routes)**
Edit `app/root.tsx`:

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <MyContextProvider>
            <NavBar />
            {children}
          </MyContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

**Option B: Authenticated routes only**
Edit `app/layouts/authenticated-layout.tsx`:

```tsx
import { Outlet } from "react-router";
import { DocumentContextProvider } from "@/context/DocumentContext";
import { MyContextProvider } from "@/context/MyContext";

export default function AuthenticatedLayout() {
  return (
    <DocumentContextProvider>
      <MyContextProvider>
        <Outlet />
      </MyContextProvider>
    </DocumentContextProvider>
  );
}
```

**Option C: Specific route group**
Create a new layout file and nest it in `routes.ts`:

```typescript
export default [
  route("login", "routes/login.tsx"),
  
  layout("layouts/authenticated-layout.tsx", [
    index("routes/dashboard.tsx"),
    
    // Nested layout for specific routes
    layout("layouts/admin-layout.tsx", [
      route("admin/users", "routes/admin/users.tsx"),
      route("admin/settings", "routes/admin/settings.tsx"),
    ]),
  ]),
  
  route("*", "routes/not_found.tsx"),
] satisfies RouteConfig;
```

---

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_AUTH_SERVICE_ENDPOINT=http://localhost:8080
VITE_DOCUMENTS_SERVICE_ENDPOINT=http://localhost:8081
VITE_JWT_SECRET=your-super-secret-jwt-key
VITE_APP_STAGE=development
```

**Usage in code:**
```tsx
import { getEnv } from "@/lib/utils";

const endpoint = getEnv("VITE_DOCUMENTS_SERVICE_ENDPOINT");
```

---

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🐳 Docker Deployment

Build and run using Docker:

```bash
docker build -t collaborative-editor-frontend .
docker run -p 3000:3000 collaborative-editor-frontend
```

The containerized application can be deployed to:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

---

## 📝 Best Practices

### 1. Context Usage
- ✅ Use contexts for global state (auth, theme, etc.)
- ✅ Keep contexts focused and single-purpose
- ✅ Always provide a custom hook (`useMyContext`)
- ❌ Don't overuse contexts for local state

### 2. Component Organization
- ✅ Keep components small and focused
- ✅ Extract reusable logic into custom hooks
- ✅ Use TypeScript for type safety
- ✅ Follow the single responsibility principle

### 3. Route Protection
- ✅ Always wrap authenticated routes with `<ProtectedRoute>`
- ✅ Use the layout system for shared providers
- ✅ Keep route files clean and focused

### 4. Error Handling
- ✅ Handle errors in context providers
- ✅ Display user-friendly error messages
- ✅ Use the logger utility for debugging
- ✅ Implement proper error boundaries

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📚 Additional Resources

- [React Router Documentation](https://reactrouter.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [React Context API](https://react.dev/reference/react/useContext)

---

Built with ❤️ using React Router, TypeScript, and TailwindCSS.
