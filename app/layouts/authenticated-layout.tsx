import { Outlet } from "react-router";
import { DocumentContextProvider } from "@/context/DocumentContext";

/**
 * Layout for authenticated routes that need access to DocumentContext
 * This wraps routes that require document management functionality
 */
export default function AuthenticatedLayout() {
    return (
        <DocumentContextProvider>
            <Outlet />
        </DocumentContextProvider>
    );
}
