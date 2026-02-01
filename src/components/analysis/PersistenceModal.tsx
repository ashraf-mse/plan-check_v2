"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PersistenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (email: string) => void;
}

export function PersistenceModal({ isOpen, onClose, onSuccess }: PersistenceModalProps) {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);

        try {
            // Mock API call to /api/capture
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Captured email:", email);
            onSuccess(email);
            onClose();
        } catch (err) {
            console.error("Failed to capture email:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save this analysis</DialogTitle>
                    <DialogDescription>
                        Get a permanent link to revisit these findings anytime, or share them with your team. Your raw EXPLAIN data never leaves your browser.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="email">Email for your secure link:</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button type="submit" disabled={isSubmitting || !email} className="w-full sm:flex-1">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Email me the link"
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:flex-1">
                            Maybe later
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
