/**
 * API Client for FastAPI Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiError {
  detail: string;
}

// Types based on backend schemas
export interface Document {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  is_signed: boolean;
  created_at: string;
}

export interface Signature {
  id: number;
  user_id: number;
  signature_type: "drawn" | "typed";
  signature_data: string;
  created_at: string;
}

export interface SignedDocument {
  id: number;
  document_id: number;
  signature_id: number;
  signed_file_path: string;
  signature_position_x: number;
  signature_position_y: number;
  signed_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
}

/**
 * Set authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

/**
 * Remove authentication token from localStorage
 */
export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ===== Authentication API =====
export async function register(
  username: string,
  email: string,
  password: string
): Promise<User> {
  return apiRequest<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setAuthToken(response.access_token);
  return response;
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/api/auth/me");
}

// ===== Document API =====
export async function listDocuments(): Promise<Document[]> {
  return apiRequest<Document[]>("/api/documents/");
}

export async function uploadDocument(
  file: File,
  title?: string,
  description?: string
): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  
  // Note: The backend doesn't currently accept title/description
  // but we're keeping the parameters for future use
  return apiRequest<Document>("/api/documents/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getDocument(documentId: number): Promise<Document> {
  return apiRequest<Document>(`/api/documents/${documentId}`);
}

export async function deleteDocument(
  documentId: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/documents/${documentId}`, {
    method: "DELETE",
  });
}

// ===== Signature API =====
export async function listSignatures(): Promise<Signature[]> {
  return apiRequest<Signature[]>("/api/signatures/my");
}

export async function createSignature(
  signatureType: "drawn" | "typed",
  signatureData: string
): Promise<Signature> {
  return apiRequest<Signature>("/api/signatures/create", {
    method: "POST",
    body: JSON.stringify({
      signature_type: signatureType,
      signature_data: signatureData,
    }),
  });
}

export async function getSignature(signatureId: number): Promise<Signature> {
  return apiRequest<Signature>(`/api/signatures/${signatureId}`);
}

export async function deleteSignature(
  signatureId: number
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/api/signatures/${signatureId}`, {
    method: "DELETE",
  });
}

// ===== Signed Documents API =====
export async function listSignedDocuments(): Promise<SignedDocument[]> {
  return apiRequest<SignedDocument[]>("/api/signed/");
}

export async function applySignature(
  documentId: number,
  signatureId: number,
  positionX: number = 0,
  positionY: number = 0
): Promise<SignedDocument> {
  return apiRequest<SignedDocument>("/api/signed/apply", {
    method: "POST",
    body: JSON.stringify({
      document_id: documentId,
      signature_id: signatureId,
      signature_position_x: positionX,
      signature_position_y: positionY,
    }),
  });
}

export async function getSignedDocument(
  signedDocId: number
): Promise<SignedDocument> {
  return apiRequest<SignedDocument>(`/api/signed/${signedDocId}`);
}

export async function listSignedVersions(
  documentId: number
): Promise<SignedDocument[]> {
  return apiRequest<SignedDocument[]>(`/api/signed/document/${documentId}/list`);
}

export async function downloadSignedDocument(
  signedDocId: number,
  filename: string
): Promise<void> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/signed/${signedDocId}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download signed document");
  }

  // Create blob from response
  const blob = await response.blob();
  
  // Create download link and trigger download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getSignedDocumentDownloadUrl(signedDocId: number): string {
  const token = getAuthToken();
  return `${API_BASE_URL}/api/signed/${signedDocId}/download?token=${token}`;
}

/**
 * Get document file URL
 */
export function getDocumentUrl(filePath: string): string {
  return `${API_BASE_URL}/${filePath}`;
}
