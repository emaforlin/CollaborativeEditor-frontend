import { useAuthContext } from "@/context/AuthContext";
import { Navigate } from "react-router";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * ProtectedRoute component that requires authentication
 * Automatically redirects to /login if not authenticated
 * Shows a loading state while checking authentication
 */
export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuthContext();

    // Show loading while checking authentication
    if (isLoading) {
        return fallback || (
            <div className="flex text-center items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
