import { Link } from "react-router";
import type { Document } from "@/hooks/useDocuments";

export default function DocumentItem({ document }: { document: Document }) {
    return (
        <div className="flex rounded-lg border border-gray-200 p-3 hover:bg-gray-200 hover:text-gray-900">
            <Link key={document.id} className="flex flex-col w-full" to={`/editor/${document.id}`}>
                <h2 className="text-lg font-bold text-wrap">{document.title}</h2>
                <p className="text-gray-500">Last modified: {new Date(document.updated_at).toLocaleString()}</p>
            </Link>
        </div>
    );
}
