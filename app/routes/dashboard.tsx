import { useAuthContext } from "@/context/AuthContext";
import type { Route } from "../+types/root";
import ProtectedRoute from "@/components/ProtectedRoute";
import DocumentList from "@/components/DocumentList";
import { DocumentForm, type CreateDocumentFormData } from "@/components/NewDocumentForm";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { useDocumentContext } from "@/context/DocumentContext";
import { Plus } from "lucide-react";
import { logger } from "@/lib/logger";
import DocumentDetail from "@/components/DocumentDetail";
import type { Document } from "@/context/DocumentContext";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard - Collaborative Editor" },
        { name: "description", content: "Manage your collaborative documents" },
    ];
}

export default function Dashboard() {
    const { user } = useAuthContext();
    const { createDocument } = useDocumentContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    const handleCreateDocument = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmitDocument = async (data: CreateDocumentFormData) => {
        try {
            const newDocument = await createDocument(data.title);
            logger.log("Document created successfully:", newDocument);
            setIsModalOpen(false);
        } catch (error) {
            logger.error("Failed to create document:", error);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header Section */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">My Documents</h1>
                                <p className="mt-2 text-gray-600">Manage and organize your collaborative documents</p>
                            </div>
                            <button
                                onClick={handleCreateDocument}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <Plus />
                                New Document
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
                        <div className="w-full md:w-1/3">
                            <DocumentList onSelectDocument={setSelectedDocument} />
                        </div>
                        <div className="w-full md:w-2/3">
                            <DocumentDetail
                                document={selectedDocument}
                                onDelete={() => setSelectedDocument(null)}
                            />
                        </div>
                    </div>
                </div>
                {/* Modal for creating new document */}
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Create a new document">
                    <DocumentForm onSubmit={handleSubmitDocument} />
                </Modal>
            </div>
        </ProtectedRoute>
    );
}
