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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Trash2,
  PenTool,
  ShieldCheck,
} from "lucide-react";
import { UploadModal } from "@/components/upload-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  listDocuments,
  deleteDocument,
  getDocumentUrl,
  listSignedVersions,
  type Document,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { AuthDialog } from "@/components/auth-dialog";

export default function DashboardPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signedDocIds, setSignedDocIds] = useState<Map<number, number>>(
    new Map()
  ); // document_id -> signed_doc_id
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Fetch documents from API
  const fetchDocuments = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const docs = await listDocuments();
      setDocuments(docs);

      // Fetch signed document IDs for all signed documents
      const signedDocs = docs.filter((doc) => doc.is_signed);
      const newSignedDocIds = new Map<number, number>();
      
      for (const doc of signedDocs) {
        try {
          const signedVersions = await listSignedVersions(doc.id);
          if (signedVersions && signedVersions.length > 0) {
            // Use the most recent signed version
            newSignedDocIds.set(doc.id, signedVersions[0].id);
          }
        } catch (error) {
          console.error(`Failed to fetch signed versions for document ${doc.id}:`, error);
        }
      }
      
      setSignedDocIds(newSignedDocIds);
    } catch (error) {
      toast({
        title: "Failed to load documents",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents on mount and when auth changes
  useEffect(() => {
    fetchDocuments();
  }, [isAuthenticated]);

  // Handle document deletion
  const handleDelete = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await deleteDocument(documentId);
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully",
      });
      // Refresh the list
      fetchDocuments();
    } catch (error) {
      toast({
        title: "Failed to delete document",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle document download
  const handleDownload = (doc: Document) => {
    const url = getDocumentUrl(doc.file_path);
    window.open(url, "_blank");
  };

  const stats = {
    total: documents.length,
    signed: documents.filter((d) => d.is_signed).length,
    pending: documents.filter((d) => !d.is_signed).length,
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show auth dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-muted/30">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to SignFlow</CardTitle>
              <CardDescription>
                Please sign in to manage your documents and signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => setAuthDialogOpen(true)} size="lg">
                Sign In / Register
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold text-balance">
              Welcome back, {user?.username}
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage your documents and signatures
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All uploaded documents
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Documents Signed
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  {stats.signed}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successfully signed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Signatures
                </CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">
                  {stats.pending}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting signature
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Your recently uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No documents yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first document to get started!
                  </p>
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {doc.original_filename}
                        </TableCell>
                        <TableCell>
                          {new Date(doc.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={doc.is_signed ? "default" : "secondary"}
                            className={
                              doc.is_signed
                                ? "bg-success text-success-foreground hover:bg-success/90"
                                : "bg-warning text-warning-foreground hover:bg-warning/90"
                            }
                          >
                            {doc.is_signed ? "Signed" : "Unsigned"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!doc.is_signed && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/sign/${doc.id}`}>
                                  <PenTool className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {doc.is_signed && signedDocIds.has(doc.id) && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/verify/${signedDocIds.get(doc.id)}`}>
                                  <ShieldCheck className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Floating Action Button */}
          <Button
            size="lg"
            className="fixed bottom-6 right-6 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setUploadModalOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload Document
          </Button>

          <UploadModal
            open={uploadModalOpen}
            onOpenChange={setUploadModalOpen}
            onUploadSuccess={fetchDocuments}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
