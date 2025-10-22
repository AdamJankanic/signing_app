"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { getDocumentUrl, getDocument, type Document } from "@/lib/api";

interface SignaturePosition {
  x: number;
  y: number;
  page: number;
  signatureUrl: string;
}

interface DocumentViewerProps {
  documentId: string;
  signaturePositions: SignaturePosition[];
  onPlaceSignature: (x: number, y: number, page: number) => void;
  onRemoveSignature: (index: number) => void;
}

export function DocumentViewer({
  documentId,
  signaturePositions,
  onPlaceSignature,
  onRemoveSignature,
}: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [document, setDocument] = useState<Document | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const doc = await getDocument(Number(documentId));
        setDocument(doc);
        const url = getDocumentUrl(doc.file_path);
        setDocumentUrl(url);
        // For PDFs, we'll display as iframe/embed
        // Total pages would need PDF parsing, for now default to 1
        setTotalPages(1);
      } catch (error) {
        console.error("Failed to load document:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPlaceSignature(x, y, currentPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!document || !documentUrl) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load document</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-16 text-center">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Document Display */}
      <div className="relative">
        <div
          className="relative border rounded-lg bg-white overflow-hidden"
          style={{
            minHeight: "600px",
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          {/* PDF Viewer */}
          {document.file_type === ".pdf" ? (
            <iframe
              src={`${documentUrl}#page=${currentPage}`}
              className="w-full h-[800px] border-0"
              title={document.original_filename}
            />
          ) : (
            // For image files (PNG, JPG, JPEG)
            <img
              src={documentUrl}
              alt={document.original_filename}
              className="w-full h-auto"
            />
          )}

          {/* Clickable overlay for signature placement */}
          <div
            className="absolute inset-0 cursor-crosshair"
            style={{ zIndex: 5 }}
            onClick={handleDocumentClick}
            title="Click to place signature"
          />

          {/* Placed Signatures Overlay */}
          {signaturePositions
            .filter((pos) => pos.page === currentPage)
            .map((pos, index) => (
              <div
                key={index}
                className="absolute group"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                }}
              >
                <div className="relative border-2 border-primary rounded bg-white/90 p-2 shadow-lg">
                  <img
                    src={pos.signatureUrl}
                    alt="Signature"
                    className="h-12 w-32 object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSignature(signaturePositions.indexOf(pos));
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Page Navigation - Only show for multi-page PDFs */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
