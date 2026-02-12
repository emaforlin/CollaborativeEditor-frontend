import { useAuthContext } from "@/context/AuthContext";
import type { Route } from "../+types/root";
import ProtectedRoute from "@/components/ProtectedRoute";
import DocumentList from "@/components/DocumentList";
import { DocumentForm, type CreateDocumentFormData } from "@/components/NewDocumentForm";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Dashboard() {
    const { user } = useAuthContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateDocument = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmitDocument = async (data: CreateDocumentFormData) => {
        // TODO: Implementar la lógica para crear un nuevo documento
        console.log("Creating new document with data:", data);
        // Cerrar el modal después de crear el documento
        setIsModalOpen(false);
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
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                New Document
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <DocumentList />
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
