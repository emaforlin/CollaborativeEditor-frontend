import { LoginForm } from "@/components/LoginForm";
import { useAuthContext } from "@/context/AuthContext";
import type { LoginData } from "@/components/LoginForm";
import { Navigate } from "react-router";
import { useState } from "react";

export default function LoginPage() {
    const { login, isAuthenticated } = useAuthContext();

    const onSubmit = async (data: LoginData) => {
        try {
            await login({
                email: data.email,
                password: data.password,
            });
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    return <div className="flex justify-center items-center bg-green-100 h-screen w-screen">
        <LoginForm onSubmit={onSubmit} />
        {isAuthenticated && <Navigate to="/" />}
    </div>;
}
