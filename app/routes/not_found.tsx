import { Link } from "react-router";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 px-4">
            <h1 className="text-9xl font-extrabold tracking-widest text-gray-800">404</h1>
            <div className="bg-blue-600 text-white px-2 text-sm rounded rotate-12 absolute">
                Page Not Found
            </div>
            <button className="mt-5">
                <Link
                    to="/"
                    className="relative inline-block text-sm font-medium text-blue-600 group active:text-blue-500 focus:outline-none focus:ring"
                >
                    <span className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-blue-600 group-hover:translate-y-0 group-hover:translate-x-0"></span>
                    <span className="relative block px-8 py-3 bg-white border border-current">
                        Go Home
                    </span>
                </Link>
            </button>
        </div>
    );
}
