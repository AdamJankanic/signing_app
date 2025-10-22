"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Download, Eye, Trash2, PenTool, Shield } from "lucide-react"
import { UploadModal } from "@/components/upload-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

// Mock data
const mockDocuments = [
  {
    id: 1,
    name: "Employment Contract.pdf",
    uploadDate: "2025-01-15",
    status: "signed" as const,
    size: "245 KB",
  },
  {
    id: 2,
    name: "NDA Agreement.pdf",
    uploadDate: "2025-01-18",
    status: "unsigned" as const,
    size: "180 KB",
  },
  {
    id: 3,
    name: "Service Agreement.pdf",
    uploadDate: "2025-01-20",
    status: "signed" as const,
    size: "320 KB",
  },
]

export default function DocumentsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [documents] = useState(mockDocuments)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
            <p className="text-muted-foreground mt-1">View and manage all your uploaded documents</p>
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
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "Try a different search term" : "Upload your first document to get started"}
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
                      <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            {doc.name}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <Badge
                            variant={doc.status === "signed" ? "default" : "secondary"}
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
                            <Button variant="ghost" size="icon" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {doc.status === "unsigned" ? (
                              <Button variant="ghost" size="icon" title="Sign" asChild>
                                <Link href={`/sign/${doc.id}`}>
                                  <PenTool className="h-4 w-4" />
                                </Link>
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" title="Verify" asChild>
                                <Link href={`/verify/${doc.id}`}>
                                  <Shield className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
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
        </main>

        <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}
