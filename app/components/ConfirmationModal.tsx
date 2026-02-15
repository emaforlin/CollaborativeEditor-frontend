import { Modal, type ModalProps } from "@/components/ui/modal";
import { Button } from "./ui/button";

type ConfirmationModalProps = Omit<ModalProps, "children"> & {
    title: string;
    text: string;
    affirmativeOptionText: string;
    negativeOptionText: string;
    onAffirmative: () => void;
    onNegative?: () => void;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    title,
    text,
    affirmativeOptionText,
    negativeOptionText,
    onAffirmative,
    onNegative
}: ConfirmationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-4">
                <p className="text-center">{text}</p>
                <div className="flex justify-center">
                    <Button variant="outline" onClick={onNegative ?? onClose}>
                        {negativeOptionText}
                    </Button>
                    <Button variant="destructive" onClick={onAffirmative} className="ml-2">{affirmativeOptionText}</Button>
                </div>
            </div>
        </Modal>
    );
}