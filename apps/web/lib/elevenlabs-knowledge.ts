// ElevenLabs Knowledge Base API utilities

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'url' | 'text' | 'file';
  url?: string;
  metadata?: {
    created_at_unix_secs: number;
    last_updated_at_unix_secs: number;
    size_bytes: number;
  };
  supported_usages: string[];
  access_info?: {
    is_creator: boolean;
    creator_name: string;
    creator_email: string;
    role: string;
  };
  dependent_agents?: Array<{ type: string }>;
}

export interface KnowledgeBaseResponse {
  documents: KnowledgeDocument[];
  has_more: boolean;
  next_cursor?: string;
}

export interface CreateDocumentRequest {
  type: 'url' | 'text' | 'file';
  name: string;
  url?: string;
  text?: string;
}

export interface UploadFileRequest {
  file: File;
  name: string;
}

export interface CreateDocumentResponse {
  id: string;
  name: string;
}

// List knowledge base documents
export async function listKnowledgeDocuments(params?: {
  cursor?: string;
  pageSize?: number;
  search?: string;
  showOnlyOwned?: boolean;
  types?: string[];
}): Promise<KnowledgeBaseResponse> {
  const queryParams = new URLSearchParams();

  if (params?.cursor) queryParams.append('cursor', params.cursor);
  if (params?.pageSize)
    queryParams.append('page_size', params.pageSize.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.showOnlyOwned)
    queryParams.append('show_only_owned_documents', 'true');
  if (params?.types) queryParams.append('types', params.types.join(','));

  const response = await fetch(
    `/api/elevenlabs-agent/knowledge-base?${queryParams.toString()}`,
  );

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData?.error || response.statusText;
      throw new Error(errorMessage);
    } catch {
      throw new Error(
        `Failed to fetch knowledge documents: ${response.statusText}`,
      );
    }
  }

  const data = await response.json();
  return data.data;
}

// Get specific knowledge base document
export async function getKnowledgeDocument(
  documentId: string,
  agentId?: string,
): Promise<KnowledgeDocument> {
  const queryParams = new URLSearchParams();
  if (agentId) queryParams.append('agent_id', agentId);

  const response = await fetch(
    `/api/elevenlabs-agent/knowledge-base/${documentId}?${queryParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch knowledge document: ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data.data;
}

// Create knowledge base document
export async function createKnowledgeDocument(
  request: CreateDocumentRequest,
): Promise<CreateDocumentResponse> {
  const response = await fetch('/api/elevenlabs-agent/knowledge-base', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData?.error || response.statusText;
      throw new Error(errorMessage);
    } catch {
      throw new Error(
        `Failed to create knowledge document: ${response.statusText}`,
      );
    }
  }

  const data = await response.json();
  return data.data;
}

// Upload file to knowledge base
export async function uploadKnowledgeFile(
  request: UploadFileRequest,
): Promise<CreateDocumentResponse> {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('name', request.name);

  const response = await fetch('/api/elevenlabs-agent/knowledge-base/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload knowledge file: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

// Delete knowledge base document
export async function deleteKnowledgeDocument(
  documentId: string,
): Promise<void> {
  const response = await fetch(
    `/api/elevenlabs-agent/knowledge-base/${documentId}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData?.error || response.statusText;
      throw new Error(errorMessage);
    } catch {
      throw new Error(
        `Failed to delete knowledge document: ${response.statusText}`,
      );
    }
  }
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to format date
export function formatDate(unixSecs: number): string {
  return new Date(unixSecs * 1000).toLocaleDateString();
}

// Helper function to get document type icon
export function getDocumentTypeIcon(type: string): string {
  switch (type) {
    case 'url':
      return '🌐';
    case 'text':
      return '📄';
    case 'file':
      return '📁';
    default:
      return '📚';
  }
}
