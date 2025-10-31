import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import {
  type CreateDocumentRequest,
  type KnowledgeBaseResponse,
  type KnowledgeDocument,
  type UploadFileRequest,
  createKnowledgeDocument,
  deleteKnowledgeDocument,
  listKnowledgeDocuments,
  uploadKnowledgeFile,
} from '../../../../../lib/elevenlabs-knowledge';

interface UseKnowledgeBaseOptions {
  autoLoad?: boolean;
}

interface UseKnowledgeBaseReturn {
  documents: KnowledgeDocument[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
  loadDocuments: (params?: {
    cursor?: string;
    pageSize?: number;
    search?: string;
    showOnlyOwned?: boolean;
    types?: string[];
  }) => Promise<void>;
  addDocument: (
    request: CreateDocumentRequest,
  ) => Promise<{ id: string; name: string } | undefined>;
  uploadFile: (request: UploadFileRequest) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useKnowledgeBase({
  autoLoad = true,
}: UseKnowledgeBaseOptions): UseKnowledgeBaseReturn {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  const loadDocuments = useCallback(
    async (params?: {
      cursor?: string;
      pageSize?: number;
      search?: string;
      showOnlyOwned?: boolean;
      types?: string[];
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response: KnowledgeBaseResponse =
          await listKnowledgeDocuments(params);

        if (params?.cursor) {
          // Append to existing documents for pagination
          setDocuments((prev) => [...prev, ...response.documents]);
        } else {
          // Replace documents for new search or initial load
          setDocuments(response.documents);
        }

        setHasMore(response.has_more);
        setNextCursor(response.next_cursor);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load documents';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const addDocument = useCallback(
    async (request: CreateDocumentRequest) => {
      try {
        const result = await createKnowledgeDocument(request);
        toast.success('Document added successfully');

        // Refresh the documents list
        await loadDocuments();

        // Return the created document
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add document';
        toast.error(errorMessage);
        throw err;
      }
    },
    [loadDocuments],
  );

  const uploadFile = useCallback(
    async (request: UploadFileRequest) => {
      try {
        await uploadKnowledgeFile(request);
        toast.success('File uploaded successfully');

        // Refresh the documents list
        await loadDocuments();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to upload file';
        toast.error(errorMessage);
        throw err;
      }
    },
    [loadDocuments],
  );

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      await deleteKnowledgeDocument(documentId);
      toast.success('Document deleted successfully');

      // Remove the document from the local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete document';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadDocuments();
  }, [loadDocuments]);

  // Auto-load documents when the hook is initialized
  useEffect(() => {
    if (autoLoad) {
      loadDocuments();
    }
  }, [autoLoad, loadDocuments]);

  return {
    documents,
    loading,
    error,
    hasMore,
    nextCursor,
    loadDocuments,
    addDocument,
    uploadFile,
    deleteDocument,
    refresh,
  };
}
