"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { listSignatures, getDocumentUrl, type Signature } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface SignatureSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (signatureId: number, signatureUrl: string) => void;
}

export function SignatureSelector({
  open,
  onOpenChange,
  onSelect,
}: SignatureSelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadSignatures();
    }
  }, [open]);

  const loadSignatures = async () => {
    try {
      setIsLoading(true);
      const data = await listSignatures();
      setSignatures(data);
    } catch (error) {
      console.error("Failed to load signatures:", error);
      toast({
        title: "Error",
        description: "Failed to load signatures. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Signature</DialogTitle>
          <DialogDescription>
            Choose a signature to use for signing this document
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : signatures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {signatures.map((signature) => {
                const signatureUrl = getDocumentUrl(signature.signature_data);
                return (
                  <Card
                    key={signature.id}
                    className="p-4 cursor-pointer hover:border-primary transition-colors"
                    onClick={() => onSelect(signature.id, signatureUrl)}
                  >
                    <div className="flex items-center justify-center h-24 bg-muted rounded-lg border">
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="max-h-20 max-w-full object-contain"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Created{" "}
                      {new Date(signature.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No signatures found
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a signature first to use it for signing documents
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              router.push("/signatures");
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Signature
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
