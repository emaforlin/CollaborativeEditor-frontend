import { APIClient, type APIClientConfig } from "./client";

export class DocumentService extends APIClient {
    constructor(userId: string) {
        const baseUrl = import.meta.env.VITE_DOCUMENTS_SERVICE_ENDPOINT || "";
        const config: APIClientConfig = {
            baseUrl,
            defaultHeaders: {
                "X-User-Id": userId,
            }
        };
        super(config);
    }

    async getDocuments(): Promise<Document[]> {
        return this.request<Document[]>("/documents");
    }

    async createDocument(title: string): Promise<Document> {
        return this.request<Document>("/documents", {
            method: "POST",
            body: JSON.stringify({ title }),
        });
    }

    async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
        return this.request<Document>(`/documents/${id}`, {
            method: "PUT",
            body: JSON.stringify(updates),
        });
    }

    async deleteDocument(id: string): Promise<void> {
        return this.request<void>(`/documents/${id}`, {
            method: "DELETE",
        });
    }

    async getDocument(id: string): Promise<Document> {
        return this.request<Document>(`/documents/${id}`);
    }

    async getDocumentCollaborators(id: string): Promise<DocumentCollaborator[]> {
        return this.request<DocumentCollaborator[]>(`/documents/${id}/collaborators`);
    }
}

export interface Document {
    id: string;
    owner_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface DocumentCollaborator {
    "user_id": string;
    "role": string;
}
