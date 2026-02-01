import { Link } from "react-router";
import type { Document } from "@/hooks/useDocuments";

export default function DocumentItem({ document }: { document: Document }) {
    return (
        <Link key={document.id} className="p-2 hover:bg-gray-200 hover:text-gray-900 hover:rounded" to={`/editor/${document.id}`}>{document.title}</Link>
    );
}
