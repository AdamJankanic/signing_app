"use client";

import { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { SignatureCanvas } from "@/components/signature-canvas";
import { useToast } from "@/hooks/use-toast";
import {
  listSignatures,
  createSignature,
  deleteSignature,
  getDocumentUrl,
  type Signature,
} from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SignaturesPage() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [signatureToDelete, setSignatureToDelete] = useState<Signature | null>(
    null
  );
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch signatures from API
  const fetchSignatures = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const sigs = await listSignatures();
      setSignatures(sigs);
    } catch (error) {
      toast({
        title: "Failed to load signatures",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load signatures on mount and when auth changes
  useEffect(() => {
    fetchSignatures();
  }, [isAuthenticated]);

  const handleSaveSignature = async (
    dataUrl: string,
    signatureType: "drawn" | "typed"
  ) => {
    setIsSaving(true);
    try {
      // Create signature with the specified type and the base64 data
      await createSignature(signatureType, dataUrl);

      toast({
        title: "Signature saved",
        description: "Your signature has been saved successfully",
      });

      setShowCanvas(false);
      // Refresh signatures list
      await fetchSignatures();
    } catch (error) {
      toast({
        title: "Failed to save signature",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSignature = async (id: number) => {
    try {
      await deleteSignature(id);
      toast({
        title: "Signature deleted",
        description: "Your signature has been removed",
      });
      setSignatureToDelete(null);
      // Refresh signatures list
      await fetchSignatures();
    } catch (error) {
      toast({
        title: "Failed to delete signature",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (signature: Signature) => {
    setSignatureToDelete(signature);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">My Signatures</h1>
          </div>
        </header>
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-balance">
              Manage Your Signatures
            </h2>
            <p className="text-muted-foreground mt-1">
              Create and save signatures to use when signing documents
            </p>
          </div>

          {!showCanvas ? (
            <>
              <Button
                onClick={() => setShowCanvas(true)}
                size="lg"
                disabled={isLoading}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Signature
              </Button>

              {isLoading || authLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : signatures.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {signatures.map((signature) => (
                    <Card
                      key={signature.id}
                      className="group relative overflow-hidden"
                    >
                      <CardHeader>
                        <CardTitle className="text-base">
                          {signature.signature_type === "drawn"
                            ? "Drawn Signature"
                            : "Typed Signature"}
                        </CardTitle>
                        <CardDescription>
                          Created{" "}
                          {new Date(signature.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center h-24 bg-muted rounded-lg border">
                          <img
                            src={getDocumentUrl(signature.signature_data)}
                            alt="Signature"
                            className="max-h-20 max-w-full object-contain"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive bg-transparent"
                            onClick={() => openDeleteDialog(signature)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      No signatures yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first signature to get started
                    </p>
                    <Button onClick={() => setShowCanvas(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Signature
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create Your Signature</CardTitle>
                <CardDescription>
                  Draw your signature in the canvas below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignatureCanvas
                  onSave={handleSaveSignature}
                  onCancel={() => setShowCanvas(false)}
                  isSaving={isSaving}
                />
              </CardContent>
            </Card>
          )}
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!signatureToDelete}
          onOpenChange={(open: boolean) => !open && setSignatureToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this signature. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  signatureToDelete &&
                  handleDeleteSignature(signatureToDelete.id)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
