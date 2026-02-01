import ProtectedRoute from "@/components/ProtectedRoute"
import DocumentList from "@/components/DocumentList"

export default function Documents() {
    return (
        <ProtectedRoute>
            <div className="flex justify-center">
                <h1 className="text-2xl font-bold p-4">Documents</h1>
            </div>
            <div className="flex justify-center">
                <DocumentList />
            </div>
        </ProtectedRoute>
    );
}