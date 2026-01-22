import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldGroup, FieldLabel, FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const loginFormSchema = z.object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

export function LoginForm() {
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onTouched",
    })

    const onSubmit = (data: z.infer<typeof loginFormSchema>) => {
        console.log(data);
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
                        <div className="flex justify-center pt-10">
                            <Button type="submit" className="w-full">Login</Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card >
    </>;
}   