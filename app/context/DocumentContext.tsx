import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import { useAuthContext } from "./AuthContext";
import { getEnv } from "@/lib/utils";
import { logger } from "@/lib/logger";

export interface Document {
    id: string;
    owner_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

interface DocumentContextType {
    documents: Document[];
    isLoading: boolean;
    error: string | null;
    createDocument(title: string): Promise<Document>;
    updateDocument(documentId: string, updates: Partial<Document>): Promise<Document>;
    deleteDocument(documentId: string): Promise<void>;
    fetchDocuments(): Promise<void>;
    refreshDocuments(): Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const DOCUMENTS_ENDPOINT = getEnv("VITE_DOCUMENTS_SERVICE_ENDPOINT", "");

export function DocumentContextProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthContext();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all documents for the current user
    const fetchDocuments = useCallback(async () => {
        if (!user?.sub) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${DOCUMENTS_ENDPOINT}/documents`, {
                headers: {
                    "X-User-Id": user.sub,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch documents");
            }

            const data = await response.json();
            setDocuments(data);
            logger.log("Documents fetched successfully:", data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch documents";
            logger.error("Failed to fetch documents:", err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [user?.sub]);

    // Create a new document
    const createDocument = async (title: string): Promise<Document> => {
        if (!user?.sub) {
            throw new Error("User not authenticated");
        }

        setError(null);

        try {
            const response = await fetch(`${DOCUMENTS_ENDPOINT}/documents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": user.sub,
                },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create document");
            }

            const newDocument = await response.json();
            setDocuments((prev) => [newDocument, ...prev]);
            logger.log("Document created successfully:", newDocument);
            return newDocument;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create document";
            logger.error("Failed to create document:", err);
            setError(errorMessage);
            throw err;
        }
    };

    // Update an existing document
    const updateDocument = async (documentId: string, updates: Partial<Document>): Promise<Document> => {
        if (!user?.sub) {
            throw new Error("User not authenticated");
        }

        setError(null);

        try {
            const response = await fetch(`${DOCUMENTS_ENDPOINT}/documents/${documentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": user.sub,
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update document");
            }

            const updatedDocument = await response.json();
            setDocuments((prev) =>
                prev.map((doc) => (doc.id === documentId ? updatedDocument : doc))
            );
            logger.log("Document updated successfully:", updatedDocument);
            return updatedDocument;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update document";
            logger.error("Failed to update document:", err);
            setError(errorMessage);
            throw err;
        }
    };

    // Delete a document
    const deleteDocument = async (documentId: string): Promise<void> => {
        if (!user?.sub) {
            throw new Error("User not authenticated");
        }

        setError(null);

        try {
            const response = await fetch(`${DOCUMENTS_ENDPOINT}/documents/${documentId}`, {
                method: "DELETE",
                headers: {
                    "X-User-Id": user.sub,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete document");
            }

            setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
            logger.log("Document deleted successfully:", documentId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete document";
            logger.error("Failed to delete document:", err);
            setError(errorMessage);
            throw err;
        }
    };

    // Refresh documents (alias for fetchDocuments for clarity)
    const refreshDocuments = fetchDocuments;

    // Fetch documents when user changes
    useEffect(() => {
        if (user) {
            fetchDocuments();
        } else {
            setDocuments([]);
            setIsLoading(false);
        }
    }, [user, fetchDocuments]);

    const value: DocumentContextType = {
        documents,
        isLoading,
        error,
        createDocument,
        updateDocument,
        deleteDocument,
        fetchDocuments,
        refreshDocuments,
    };

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    );
}

export function useDocumentContext() {
    const context = useContext(DocumentContext);
    if (context === undefined) {
        throw new Error("useDocumentContext must be used within a DocumentContextProvider");
    }
    return context;
}