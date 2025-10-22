"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { SignatureCanvas } from "@/components/signature-canvas"
import { useToast } from "@/hooks/use-toast"

interface SavedSignature {
  id: number
  dataUrl: string
  createdAt: string
}

export default function SignaturesPage() {
  const [showCanvas, setShowCanvas] = useState(false)
  const [signatures, setSignatures] = useState<SavedSignature[]>([
    {
      id: 1,
      dataUrl: "/handwritten-signature.png",
      createdAt: "2025-01-15",
    },
  ])
  const { toast } = useToast()

  const handleSaveSignature = (dataUrl: string) => {
    const newSignature: SavedSignature = {
      id: Date.now(),
      dataUrl,
      createdAt: new Date().toISOString(),
    }
    setSignatures([newSignature, ...signatures])
    setShowCanvas(false)
    toast({
      title: "Signature saved",
      description: "Your signature has been saved successfully",
    })
  }

  const handleDeleteSignature = (id: number) => {
    setSignatures(signatures.filter((sig) => sig.id !== id))
    toast({
      title: "Signature deleted",
      description: "Your signature has been removed",
    })
  }

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
            <h2 className="text-3xl font-bold text-balance">Manage Your Signatures</h2>
            <p className="text-muted-foreground mt-1">Create and save signatures to use when signing documents</p>
          </div>

          {!showCanvas ? (
            <>
              <Button onClick={() => setShowCanvas(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create New Signature
              </Button>

              {signatures.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {signatures.map((signature) => (
                    <Card key={signature.id} className="group relative overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-base">Signature</CardTitle>
                        <CardDescription>Created {new Date(signature.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center h-24 bg-muted rounded-lg border">
                          <img
                            src={signature.dataUrl || "/placeholder.svg"}
                            alt="Signature"
                            className="max-h-20 max-w-full object-contain"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive bg-transparent"
                            onClick={() => handleDeleteSignature(signature.id)}
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
                    <h3 className="text-lg font-semibold mb-2">No signatures yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first signature to get started</p>
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
                <CardDescription>Draw your signature in the canvas below</CardDescription>
              </CardHeader>
              <CardContent>
                <SignatureCanvas onSave={handleSaveSignature} onCancel={() => setShowCanvas(false)} />
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
