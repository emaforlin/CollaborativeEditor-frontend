import DocumentItem from "@/components/DocumentItem";
import { useDocumentContext } from "@/context/DocumentContext";
import type { Document } from "@/context/DocumentContext";


interface DocumentListProps {
    onSelectDocument: (document: Document) => void;
}

export default function DocumentList({ onSelectDocument }: DocumentListProps) {
    const { documents } = useDocumentContext()
    return (
        <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: 'max-content' }}>
            {
                documents.map((document) => (
                    <div key={document.id} onClick={() => onSelectDocument(document)}>
                        <DocumentItem document={document} />
                    </div>
                ))
            }
        </div >
    );
}