import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldGroup, FieldLabel, FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAppStage, Stage } from "@/hooks/useAppStage";

const createDocumentFormSchema = z.object({
    title: z.string("Enter a valid title").min(1, "Title is required").max(256, "Title must be at most 256 characters long"),
});

export type CreateDocumentFormData = z.infer<typeof createDocumentFormSchema>;

interface DocumentFormProps {
    onSubmit: (data: CreateDocumentFormData) => Promise<void> | void;
}

export function DocumentForm(documentFormProps: DocumentFormProps) {
    const stage = useAppStage();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<CreateDocumentFormData>({
        resolver: zodResolver(createDocumentFormSchema),
        defaultValues: {
            title: "",
        },
        mode: "onTouched",
    })

    const onSubmit = async (data: CreateDocumentFormData) => {
        setErrorMessage(null);
        try {
            await documentFormProps.onSubmit(data);
        } catch (error: any) {
            setErrorMessage(stage === Stage.PRODUCTION ? "Document creation failed" : error instanceof Error ? `${stage} mode - literal error: ${error.message}` : "An unexpected error occurred");
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <FieldGroup className="flex flex-col gap-4">
                <div>
                    <FieldLabel className="text-base font-medium text-gray-700">Document title</FieldLabel>
                    <Controller
                        name="title"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <Input
                                    {...field}
                                    placeholder="How to create a collaborative documents app..."
                                    className="mt-1"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>

                {errorMessage && <FieldError className="text-center" errors={[{ message: errorMessage }]} />}

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="submit" className="px-6">
                        Create Document
                    </Button>
                </div>
            </FieldGroup>
        </form>
    );
}