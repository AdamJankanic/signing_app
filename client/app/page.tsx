"use client";

import { useState } from "react";
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

// Mock data for demonstration
const mockDocuments = [
  {
    id: 1,
    name: "Employment Contract.pdf",
    uploadDate: "2025-01-15",
    status: "signed" as const,
  },
  {
    id: 2,
    name: "NDA Agreement.pdf",
    uploadDate: "2025-01-18",
    status: "unsigned" as const,
  },
  {
    id: 3,
    name: "Service Agreement.pdf",
    uploadDate: "2025-01-20",
    status: "signed" as const,
  },
];

export default function DashboardPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [documents] = useState(mockDocuments);

  const stats = {
    total: documents.length,
    signed: documents.filter((d) => d.status === "signed").length,
    pending: documents.filter((d) => d.status === "unsigned").length,
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold text-balance">
              Welcome back, John
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
              {documents.length === 0 ? (
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
                          {doc.name}
                        </TableCell>
                        <TableCell>
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              doc.status === "signed" ? "default" : "secondary"
                            }
                            className={
                              doc.status === "signed"
                                ? "bg-success text-success-foreground hover:bg-success/90"
                                : "bg-warning text-warning-foreground hover:bg-warning/90"
                            }
                          >
                            {doc.status === "signed" ? "Signed" : "Unsigned"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {doc.status === "unsigned" && (
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/sign/${doc.id}`}>
                                  <PenTool className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
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
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
