import TextCanvas from "@/components/TextCanvas";
import type { Route } from "./+types/home";
import { useAuthContext } from "@/context/AuthContext";
import { Navigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { isAuthenticated } = useAuthContext();

  return (
    <div className="flex text-center items-center justify-center h-screen my-20">
      {isAuthenticated ? <TextCanvas /> : <Navigate to="/login" />}
    </div>
  );
}
