"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface SignatureSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (signatureUrl: string) => void
}

// Mock saved signatures
const mockSignatures = [
  {
    id: 1,
    dataUrl: "/handwritten-signature.png",
    createdAt: "2025-01-15",
  },
]

export function SignatureSelector({ open, onOpenChange, onSelect }: SignatureSelectorProps) {
  const router = useRouter()
  const [signatures] = useState(mockSignatures)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Signature</DialogTitle>
          <DialogDescription>Choose a signature to use for signing this document</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {signatures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {signatures.map((signature) => (
                <Card
                  key={signature.id}
                  className="p-4 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelect(signature.dataUrl)}
                >
                  <div className="flex items-center justify-center h-24 bg-muted rounded-lg border">
                    <img
                      src={signature.dataUrl || "/placeholder.svg"}
                      alt="Signature"
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Created {new Date(signature.createdAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No signatures found</h3>
              <p className="text-muted-foreground mb-4">Create a signature first to use it for signing documents</p>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              router.push("/signatures")
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Signature
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
