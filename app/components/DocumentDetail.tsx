import { Link } from "react-router";
import type { Document } from "@/context/DocumentContext";
import { Badge } from "./Badge";
import { Calendar, FileText, Pencil, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { ConfirmationModal } from "./ConfirmationModal";
import { useState } from "react";
import { useDocumentContext } from "@/context/DocumentContext";
import { logger } from "@/lib/logger";

interface DocumentDetailProps {
    document: Document | null;
    onDelete?: () => void;
}

export default function DocumentDetail({ document, onDelete }: DocumentDetailProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const { deleteDocument } = useDocumentContext();

    if (!document) {
        return (
            <div className="rounded-xl shadow-sm border border-gray-200 p-6 h-full flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <FileText className="mx-auto h-16 w-16 mb-4" />

                    <p className="text-lg font-medium">No document selected</p>
                    <p className="text-sm mt-1">Select a document from the list to view details</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
            time: date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };

    const createdDate = formatDate(document.created_at);
    const updatedDate = formatDate(document.updated_at);

    const handleDeleteDocument = async () => {
        const res = await deleteDocument(document.id);

        logger.log("Delete document response:", res);
        setIsDeleteModalOpen(false);
        if (onDelete) onDelete();
    };

    return (
        <div className="rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">
                            {document.title}
                        </h1>
                        {/* <Badge text="Active" /> */}
                    </div>
                </div>
            </div>

            {/* Document Information */}
            <div className="flex-1 space-y-6">
                {/* Document ID */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Document ID
                    </h3>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 break-all">
                        {document.id}
                    </p>
                </div>

                {/* Owner ID */}
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Owner
                    </h3>
                    <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 break-all">
                        {document.owner_id}
                    </p>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Created At */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center mb-2">
                            <Calendar />
                            <h3 className="text-sm font-semibold text-blue-900">Created</h3>
                        </div>
                        <p className="text-gray-700 font-medium">{createdDate.date}</p>
                        <p className="text-sm text-gray-600">{createdDate.time}</p>
                    </div>

                    {/* Updated At */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                        <div className="flex items-center mb-2">
                            <Calendar />
                            <h3 className="text-sm font-semibold text-green-900">Last Modified</h3>
                        </div>
                        <p className="text-gray-700 font-medium">{updatedDate.date}</p>
                        <p className="text-sm text-gray-600">{updatedDate.time}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                <Link
                    to={`/editor/${document.id}`}
                    className="w-2/3 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    <Pencil className="mr-2" />
                    Open in Editor
                </Link>
                <Button onClick={() => setIsDeleteModalOpen(true)} className="w-1/4 h-full text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md">
                    <Trash className="mr-2" />
                    Eliminar
                </Button>
            </div>

            {/* Deletion modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onAffirmative={() => handleDeleteDocument()}
                title="Delete Document"
                text="Are you sure you want to delete this document?"
                affirmativeOptionText="Delete"
                negativeOptionText="Cancel" />
        </div>
    );
}
