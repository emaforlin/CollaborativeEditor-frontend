import { useAuthContext } from "@/context/AuthContext";

export default function NavBar() {
    const { isAuthenticated, logout } = useAuthContext();
    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Collaborative Editor</h1>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-gray-400">Home</a>
                        <a href="#" className="hover:text-gray-400">About</a>
                        <a href="#" className="hover:text-gray-400">Contact</a>
                        {isAuthenticated && <button onClick={() => logout()} className="bg-transparent hover:text-gray-400">Logout</button>}
                    </div>
                </div>
            </div>
        </nav>
    );
}