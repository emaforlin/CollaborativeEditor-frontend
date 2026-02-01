import { useAuthContext } from "@/context/AuthContext";
import type { Route } from "../+types/root";
import { Link } from "react-router";
import ProtectedRoute from "@/components/ProtectedRoute";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Dashboard() {
    const { user } = useAuthContext();

    return (
        <ProtectedRoute>
            <div className="flex flex-col gap-4 text-center p-4 w-[60%] mx-auto">
                <h1 className="text-2xl font-bold">Welcome, {user?.sub}</h1>
                <ul className="list-disc flex justify-left">
                    <li className="hover:underline"><Link to="/documents">Documents</Link></li>
                </ul>
            </div>
        </ProtectedRoute>
    );
}
