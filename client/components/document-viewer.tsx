"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut } from "lucide-react";

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
  const totalPages = 3; // Mock data

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onPlaceSignature(x, y, currentPage);
  };

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
      <div
        className="relative border rounded-lg bg-white overflow-hidden cursor-crosshair"
        style={{
          aspectRatio: "8.5 / 11",
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
        onClick={handleDocumentClick}
      >
        {/* Mock document content */}
        <div className="p-12 space-y-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Employment Contract
            </h2>
            <p className="text-sm text-gray-600">Page {currentPage}</p>
          </div>
          <div className="space-y-3 text-gray-800">
            <p className="text-sm leading-relaxed">
              This Employment Agreement ("Agreement") is entered into as of
              January 15, 2025, by and between Company Name ("Employer") and
              Employee Name ("Employee").
            </p>
            <p className="text-sm leading-relaxed">
              <strong>1. Position and Duties:</strong> The Employee agrees to
              serve as [Job Title] and shall perform all duties and
              responsibilities associated with this position.
            </p>
            <p className="text-sm leading-relaxed">
              <strong>2. Compensation:</strong> The Employee shall receive an
              annual salary of $[Amount], payable in accordance with the
              Employer's standard payroll practices.
            </p>
            <p className="text-sm leading-relaxed">
              <strong>3. Benefits:</strong> The Employee shall be entitled to
              participate in all employee benefit plans maintained by the
              Employer.
            </p>
            {currentPage === 3 && (
              <div className="mt-12 pt-8 border-t border-gray-300">
                <p className="text-sm font-semibold mb-4">Signatures:</p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Employee Signature:
                    </p>
                    <div className="border-b border-gray-400 h-16"></div>
                    <p className="text-xs text-gray-500 mt-1">
                      Date: _______________
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Employer Signature:
                    </p>
                    <div className="border-b border-gray-400 h-16"></div>
                    <p className="text-xs text-gray-500 mt-1">
                      Date: _______________
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Placed Signatures */}
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
              }}
            >
              <div className="relative border-2 border-primary rounded bg-white/90 p-2 shadow-lg">
                <img
                  src={pos.signatureUrl || "/placeholder.svg"}
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

      {/* Page Navigation */}
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
    </div>
  );
}
