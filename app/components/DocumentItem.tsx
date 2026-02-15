import type { Document } from "@/context/DocumentContext";

export default function DocumentItem({ document }: { document: Document }) {
    return (
        <div className="flex rounded-lg border border-gray-200 p-3 hover:bg-gray-200 hover:text-gray-900">
            <div key={document.id} className="flex flex-col w-full">
                <h2 className="text-lg font-bold text-wrap">{document.title}</h2>
                <p className="text-gray-500">Last modified: {new Date(document.updated_at).toLocaleString()}</p>
            </div>
        </div>
    );
}
