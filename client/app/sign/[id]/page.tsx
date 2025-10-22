"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Check } from "lucide-react"
import Link from "next/link"
import { DocumentViewer } from "@/components/document-viewer"
import { SignatureSelector } from "@/components/signature-selector"
import { useToast } from "@/hooks/use-toast"

// Mock document data
const mockDocument = {
  id: 1,
  name: "Employment Contract.pdf",
  uploadDate: "2025-01-15",
  status: "unsigned" as const,
  pages: 3,
}

export default function SignDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null)
  const [signaturePositions, setSignaturePositions] = useState<
    Array<{ x: number; y: number; page: number; signatureUrl: string }>
  >([])
  const [showSignatureSelector, setShowSignatureSelector] = useState(false)

  const handlePlaceSignature = (x: number, y: number, page: number) => {
    if (!selectedSignature) {
      setShowSignatureSelector(true)
      return
    }

    setSignaturePositions([
      ...signaturePositions,
      {
        x,
        y,
        page,
        signatureUrl: selectedSignature,
      },
    ])
  }

  const handleRemoveSignature = (index: number) => {
    setSignaturePositions(signaturePositions.filter((_, i) => i !== index))
  }

  const handleSignDocument = () => {
    if (signaturePositions.length === 0) {
      toast({
        title: "No signatures placed",
        description: "Please place at least one signature on the document",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Document signed",
      description: "Your document has been signed successfully",
    })

    // Redirect to dashboard after signing
    setTimeout(() => {
      router.push("/")
    }, 1500)
  }

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
            <h1 className="text-xl font-semibold">{mockDocument.name}</h1>
          </div>
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
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
                  <Button className="w-full" onClick={() => setShowSignatureSelector(true)}>
                    Select Signature
                  </Button>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Instructions</h3>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Select a signature from your saved signatures</li>
                  <li>Click on the document where you want to place your signature</li>
                  <li>Review the placement and adjust if needed</li>
                  <li>Click "Sign Document" to complete</li>
                </ol>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Signatures Placed</h3>
                <p className="text-2xl font-bold text-primary">{signaturePositions.length}</p>
                <p className="text-sm text-muted-foreground">signature(s) on this document</p>
              </Card>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSignDocument}
                  disabled={signaturePositions.length === 0}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Sign Document
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/">
                    <Download className="h-4 w-4 mr-2" />
                    Download Original
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>

        <SignatureSelector
          open={showSignatureSelector}
          onOpenChange={setShowSignatureSelector}
          onSelect={(signatureUrl) => {
            setSelectedSignature(signatureUrl)
            setShowSignatureSelector(false)
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
