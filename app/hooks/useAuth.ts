
import { useAuthContext } from "~/context/AuthContext";

// Re-exporting useAuth to match the previous interface usage as close as possible, 
// though the component implementation will need to change from async to sync.
export function useAuth(tokenArgs?: string) {
    const context = useAuthContext();
    // If the component passes a token explicitly (like in the old version),
    // we might want to warn or just ignore it since the context handles it.
    // context.token should be the source of truth.

    return context.user;
}

// Also export the full context hook if they need more than just the user
export { useAuthContext };
