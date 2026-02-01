import { useAuthContext } from "@/context/AuthContext";
import { getEnv } from "@/lib/utils";
import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";


export interface Document {
    id: string;
    owner_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export function useDocuments() {
    const { user } = useAuthContext();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchDocuments();
        }
    }, [user]);

    const fetchDocuments = async () => {
        const endpoint = getEnv("VITE_DOCUMENTS_SERVICE_ENDPOINT", "")
        try {
            const response = await fetch(`${endpoint}/documents`, {
                headers: {
                    "X-User-Id": user?.sub || "",
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            logger.log(data);
            setDocuments(data);
            setLoading(false);
        } catch (error) {
            logger.error("Failed to fetch documents:", error);
            setError("Failed to fetch documents");
            setLoading(false);
        }
    };

    return { documents, loading, error };
}   