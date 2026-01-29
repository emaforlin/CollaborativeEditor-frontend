import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldGroup, FieldLabel, FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAppStage, Stage } from "@/hooks/useAppStage";


const loginFormSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type LoginData = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
    onSubmit: (data: LoginData) => Promise<void> | void;
}

export function LoginForm(loginFormProps: LoginFormProps) {
    const stage = useAppStage();
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const form = useForm<LoginData>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onTouched",
    })

    const onSubmit = async (data: LoginData) => {
        setErrorMessage(null);
        try {
            await loginFormProps.onSubmit(data);
        } catch (error: any) {
            setErrorMessage(stage === Stage.PRODUCTION ? "Login failed" : error instanceof Error ? `${stage} mode - literal error: ${error.message}` : "An unexpected error occurred");
        }
    }
    return <>
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle className="flex justify-center text-2xl">Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup className="flex flex-col gap-3">
                        <FieldLabel>Email</FieldLabel>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <Input {...field} placeholder="example@example.com" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <FieldLabel>Password</FieldLabel>
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="flex items-center gap-2">
                                        <Input {...field} placeholder="1q2w3e4R!" type={passwordVisible ? "text" : "password"} />
                                        <Button variant="ghost" onClick={() => setPasswordVisible(!passwordVisible)}>
                                            {passwordVisible ? <Eye /> : <EyeOff />}
                                        </Button>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </div>
                                </Field>
                            )}
                        />
                        {errorMessage && <FieldError className="text-center" errors={[{ message: errorMessage }]} />}
                        <div className="flex justify-center pt-10">
                            <Button type="submit" className="w-full">Login</Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card >
    </>;
}   