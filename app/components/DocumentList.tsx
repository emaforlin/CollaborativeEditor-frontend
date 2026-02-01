import { useDocuments } from "@/hooks/useDocuments";
import DocumentItem from "@/components/DocumentItem";

export default function DocumentList() {
    const { documents } = useDocuments()
    return (
        <div className="flex flex-col gap-4">
            {documents.map((document) => (
                <DocumentItem key={document.id} document={document} />
            ))}
        </div>
    );
}