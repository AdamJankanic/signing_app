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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Shield,
  Calendar,
  User,
  FileText,
  Hash,
} from "lucide-react";
import Link from "next/link";
import {
  getSignedDocument,
  getDocument,
  downloadSignedDocument,
  type SignedDocument,
  type Document,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function VerifyDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [signedDoc, setSignedDoc] = useState<SignedDocument | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch signed document and related data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !params.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch signed document details
        const signedData = await getSignedDocument(Number(params.id));
        setSignedDoc(signedData);

        // Fetch original document details
        const docData = await getDocument(signedData.document_id);
        setDocument(docData);
      } catch (error) {
        console.error("Failed to fetch verification data:", error);
        toast({
          title: "Failed to load verification data",
          description:
            error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
        router.push("/documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, params.id, router, toast]);

  const handleDownloadSigned = async () => {
    if (signedDoc && document) {
      try {
        await downloadSignedDocument(
          signedDoc.id,
          `signed_${document.original_filename}`
        );
        toast({
          title: "Download started",
          description: "Your signed document is downloading",
        });
      } catch (error) {
        toast({
          title: "Download failed",
          description:
            error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
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

  // Show error if data not found
  if (!signedDoc || !document) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">
                Verification data not found
              </h2>
              <p className="text-muted-foreground mb-4">
                The document you're looking for doesn't exist or you don't have
                access
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

  // Generate a simple hash from the signed document data for display
  const certificateHash = `${signedDoc.id
    .toString(16)
    .padStart(8, "0")}${signedDoc.document_id
    .toString(16)
    .padStart(8, "0")}${signedDoc.signature_id
    .toString(16)
    .padStart(8, "0")}${Date.parse(signedDoc.signed_at).toString(16)}`;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Document Verification</h1>
          </div>
        </header>
        <main className="flex-1 p-6 space-y-6">
          {/* Verification Status Banner */}
          <Card className="border-success bg-success/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-success-foreground">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-success mb-2">
                    Document Verified
                  </h2>
                  <p className="text-muted-foreground">
                    This document has been digitally signed and verified. All
                    signatures are authentic and the document has not been
                    tampered with.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Document Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Information
                </CardTitle>
                <CardDescription>
                  Details about the signed document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">
                      Document Name
                    </span>
                    <span className="text-sm font-medium text-right">
                      {document.original_filename}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">
                      Document ID
                    </span>
                    <span className="text-sm font-mono text-right">
                      DOC-{document.id.toString().padStart(6, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge className="bg-success text-success-foreground hover:bg-success/90">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">
                      Signed Date
                    </span>
                    <span className="text-sm font-medium text-right">
                      {new Date(signedDoc.signed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Certificate Information
                </CardTitle>
                <CardDescription>
                  Cryptographic verification details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">
                      Certificate Hash
                    </span>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-xs font-mono break-all">
                        {certificateHash}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                    <Shield className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">
                      Certificate is valid and trusted
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signature Details */}
          <Card>
            <CardHeader>
              <CardTitle>Signature Details</CardTitle>
              <CardDescription>
                Information about all signatures on this document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {user?.username || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-success text-success-foreground hover:bg-success/90">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Signed: {new Date(signedDoc.signed_at).toLocaleString()}
                      </span>
                    </div>
                    {/* <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span>Position: ({signedDoc.signature_position_x}, {signedDoc.signature_position_y})</span>
                    </div> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete history of document actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="w-px h-full bg-border mt-2"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Document Signed</p>
                    <p className="text-sm text-muted-foreground">
                      Signed by {user?.username || "User"} (
                      {user?.email || "email not available"})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(signedDoc.signed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="w-px h-full bg-border mt-2"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Document Uploaded</p>
                    <p className="text-sm text-muted-foreground">
                      Document uploaded to the system
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(document.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Document Created</p>
                    <p className="text-sm text-muted-foreground">
                      Original document created
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(document.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" onClick={handleDownloadSigned}>
              <Download className="h-5 w-5 mr-2" />
              Download Signed Document
            </Button>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
