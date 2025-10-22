"use client"

import { useParams } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, CheckCircle2, Shield, Calendar, User, FileText, Hash } from "lucide-react"
import Link from "next/link"

// Mock verification data
const mockVerification = {
  documentId: "DOC-2025-001",
  documentName: "Employment Contract.pdf",
  status: "verified" as const,
  signedDate: "2025-01-22T14:30:00Z",
  signerName: "John Doe",
  signerEmail: "john@example.com",
  certificateHash: "a3f5c8d9e2b1f4a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
  signatures: [
    {
      id: 1,
      signerName: "John Doe",
      signerEmail: "john@example.com",
      signedAt: "2025-01-22T14:30:00Z",
      ipAddress: "192.168.1.1",
    },
  ],
}

export default function VerifyDocumentPage() {
  const params = useParams()

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
                  <h2 className="text-2xl font-bold text-success mb-2">Document Verified</h2>
                  <p className="text-muted-foreground">
                    This document has been digitally signed and verified. All signatures are authentic and the document
                    has not been tampered with.
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
                <CardDescription>Details about the signed document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Document Name</span>
                    <span className="text-sm font-medium text-right">{mockVerification.documentName}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Document ID</span>
                    <span className="text-sm font-mono text-right">{mockVerification.documentId}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className="bg-success text-success-foreground hover:bg-success/90">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">Signed Date</span>
                    <span className="text-sm font-medium text-right">
                      {new Date(mockVerification.signedDate).toLocaleString()}
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
                <CardDescription>Cryptographic verification details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Certificate Hash</span>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-xs font-mono break-all">{mockVerification.certificateHash}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                    <Shield className="h-4 w-4 text-success" />
                    <span className="text-sm text-success font-medium">Certificate is valid and trusted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signature Details */}
          <Card>
            <CardHeader>
              <CardTitle>Signature Details</CardTitle>
              <CardDescription>Information about all signatures on this document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockVerification.signatures.map((signature, index) => (
                  <div key={signature.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{signature.signerName}</p>
                          <p className="text-sm text-muted-foreground">{signature.signerEmail}</p>
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
                        <span>Signed: {new Date(signature.signedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        <span>IP: {signature.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Complete history of document actions</CardDescription>
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
                      Signed by {mockVerification.signerName} ({mockVerification.signerEmail})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(mockVerification.signedDate).toLocaleString()}
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
                    <p className="text-sm text-muted-foreground">Document uploaded to the system</p>
                    <p className="text-xs text-muted-foreground mt-1">January 15, 2025 at 10:00 AM</p>
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
                    <p className="text-sm text-muted-foreground">Original document created</p>
                    <p className="text-xs text-muted-foreground mt-1">January 15, 2025 at 9:00 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg">
              <Download className="h-5 w-5 mr-2" />
              Download Signed Document
            </Button>
            <Button variant="outline" size="lg">
              <Download className="h-5 w-5 mr-2" />
              Download Certificate
            </Button>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
