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
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  Trash2,
  PenTool,
  Shield,
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
  type Document,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function DocumentsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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
  const handleDelete = async (documentId: number, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
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

  // Handle document download/view
  const handleDownload = (doc: Document) => {
    const url = getDocumentUrl(doc.file_path);
    window.open(url, "_blank");
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">My Documents</h1>
          </div>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </header>
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-balance">All Documents</h2>
            <p className="text-muted-foreground mt-1">
              View and manage all your uploaded documents
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                {filteredDocuments.length} document
                {filteredDocuments.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || authLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No documents found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try a different search term"
                      : "Upload your first document to get started"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setUploadModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            {doc.original_filename}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(doc.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatFileSize(doc.file_size)}</TableCell>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View"
                              onClick={() => handleDownload(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!doc.is_signed ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Sign"
                                asChild
                              >
                                <Link href={`/sign/${doc.id}`}>
                                  <PenTool className="h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Verify"
                                asChild
                              >
                                <Link href={`/verify/${doc.id}`}>
                                  <Shield className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Download"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                handleDelete(doc.id, doc.original_filename)
                              }
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
        </main>

        <UploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          onUploadSuccess={fetchDocuments}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
