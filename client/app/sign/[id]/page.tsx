"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Check } from "lucide-react";
import Link from "next/link";
import { DocumentViewer } from "@/components/document-viewer";
import { SignatureSelector } from "@/components/signature-selector";
import { useToast } from "@/hooks/use-toast";
import {
  getDocument,
  getDocumentUrl,
  applySignature,
  type Document,
} from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function SignDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(
    null
  );
  const [selectedSignatureId, setSelectedSignatureId] = useState<number | null>(
    null
  );
  const [signaturePositions, setSignaturePositions] = useState<
    Array<{ x: number; y: number; page: number; signatureUrl: string }>
  >([]);
  const [showSignatureSelector, setShowSignatureSelector] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      if (!isAuthenticated || !params.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const doc = await getDocument(Number(params.id));

        // Check if document is already signed
        if (doc.is_signed) {
          toast({
            title: "Document already signed",
            description: "This document has already been signed",
            variant: "destructive",
          });
          router.push("/documents");
          return;
        }

        setDocument(doc);
      } catch (error) {
        toast({
          title: "Failed to load document",
          description:
            error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
        router.push("/documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [isAuthenticated, params.id, router, toast]);

  const handlePlaceSignature = (x: number, y: number, page: number) => {
    if (!selectedSignature) {
      setShowSignatureSelector(true);
      return;
    }

    console.log("Placing signature at:", {
      x,
      y,
      page,
      signatureUrl: selectedSignature,
    });

    setSignaturePositions([
      ...signaturePositions,
      {
        x,
        y,
        page,
        signatureUrl: selectedSignature,
      },
    ]);

    // toast({
    //   title: "Signature placed",
    //   description: `Signature placed at position (${Math.round(
    //     x
    //   )}, ${Math.round(y)})`,
    // });
  };

  const handleRemoveSignature = (index: number) => {
    setSignaturePositions(signaturePositions.filter((_, i) => i !== index));
  };

  const handleSignDocument = async () => {
    if (signaturePositions.length === 0) {
      toast({
        title: "No signatures placed",
        description: "Please place at least one signature on the document",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSignatureId || !document) {
      toast({
        title: "Error",
        description: "Missing signature or document information",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSigning(true);

      // Apply each signature position to the document
      // For now, we'll use the first signature position
      // In a full implementation, you might need to support multiple signatures
      const firstPosition = signaturePositions[0];

      const signedDoc = await applySignature(
        document.id,
        selectedSignatureId,
        Math.round(firstPosition.x) * 14,
        Math.round(firstPosition.y) * 17
      );

      toast({
        title: "Document signed successfully",
        description: "Your document has been signed and saved",
      });

      // Redirect to documents page after a short delay
      setTimeout(() => {
        router.push("/documents");
      }, 1500);
    } catch (error) {
      console.error("Failed to sign document:", error);
      toast({
        title: "Failed to sign document",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  // Handle download original document
  const handleDownloadOriginal = () => {
    if (document) {
      const url = getDocumentUrl(document.file_path);
      window.open(url, "_blank");
    }
  };

  // Show loading state
  if (isLoading || authLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Show error if document not found
  if (!document) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Document not found</h2>
              <p className="text-muted-foreground mb-4">
                The document you're looking for doesn't exist
              </p>
              <Button asChild>
                <Link href="/documents">Go to Documents</Link>
              </Button>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <Link href="/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {document.original_filename}
            </h1>
          </div>
          <Badge
            variant="secondary"
            className="bg-warning text-warning-foreground"
          >
            Unsigned
          </Badge>
        </header>
        <main className="flex-1 p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Document Viewer */}
            <div className="space-y-4">
              <Card className="p-6">
                <DocumentViewer
                  documentId={params.id as string}
                  signaturePositions={signaturePositions}
                  onPlaceSignature={handlePlaceSignature}
                  onRemoveSignature={handleRemoveSignature}
                />
              </Card>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Signature</h3>
                {selectedSignature ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <img
                        src={selectedSignature || "/placeholder.svg"}
                        alt="Selected signature"
                        className="max-h-16 w-full object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setShowSignatureSelector(true)}
                    >
                      Change Signature
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => setShowSignatureSelector(true)}
                  >
                    Select Signature
                  </Button>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Instructions</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Select a signature from your saved signatures</li>
                  <li>
                    Click on the document where you want to place your signature
                  </li>
                  <li>Review the placement and adjust if needed</li>
                  <li>Click "Sign Document" to complete</li>
                </ol>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Signatures Placed</h3>
                <p className="text-2xl font-bold text-primary">
                  {signaturePositions.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  signature(s) on this document
                </p>
              </Card>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSignDocument}
                  disabled={signaturePositions.length === 0 || isSigning}
                >
                  <Check className="h-5 w-5 mr-2" />
                  {isSigning ? "Signing..." : "Sign Document"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleDownloadOriginal}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Original
                </Button>
              </div>
            </div>
          </div>
        </main>

        <SignatureSelector
          open={showSignatureSelector}
          onOpenChange={setShowSignatureSelector}
          onSelect={(signatureId, signatureUrl) => {
            setSelectedSignatureId(signatureId);
            setSelectedSignature(signatureUrl);
            setShowSignatureSelector(false);
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
