import DocumentItem from "@/components/DocumentItem";
import { useDocumentContext } from "@/context/DocumentContext";

export default function DocumentList() {
    const { documents } = useDocumentContext()
    return (
        <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'max-content' }}>
            {documents.map((document) => (
                <DocumentItem key={document.id} document={document} />
            ))}
        </div>
    );
}