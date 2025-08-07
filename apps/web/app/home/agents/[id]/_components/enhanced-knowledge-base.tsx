'use client';

import { useEffect, useState } from 'react';

import {
  BookOpen,
  FileText,
  Globe,
  Link,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';

import {
  type CreateDocumentRequest,
  formatDate,
  formatFileSize,
} from '../../../../../lib/elevenlabs-knowledge';
import { useKnowledgeBase } from './use-knowledge-base';

interface EnhancedKnowledgeBaseProps {
  _agentId: string;
  elevenlabsAgentId?: string;
}

interface LinkedDocument {
  id: string;
  type: string;
  name: string;
  usage_mode?: string;
}

interface KnowledgeDocument {
  id: string;
  type: string;
  name: string;
  usage_mode?: string;
  metadata?: {
    size_bytes: number;
    created_at_unix_secs: number;
  };
  url?: string;
}

export function EnhancedKnowledgeBase({
  _agentId,
  elevenlabsAgentId,
}: EnhancedKnowledgeBaseProps) {
  const {
    documents,
    loading,
    error: _error,
    addDocument: addDocumentHook,
    uploadFile: uploadFileHook,
    deleteDocument: deleteDocumentHook,
  } = useKnowledgeBase({
    elevenlabsAgentId,
    autoLoad: true,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [documentType, setDocumentType] = useState<'url' | 'text' | 'file'>(
    'url',
  );
  const [documentName, setDocumentName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [linkedDocuments, setLinkedDocuments] = useState<LinkedDocument[]>([]);
  const [loadingLinkedDocs, setLoadingLinkedDocs] = useState(false);
  const [linkingDocs, setLinkingDocs] = useState(false);
  const [unlinkingDocs, setUnlinkingDocs] = useState<string[]>([]);

  // Fetch linked documents from agent configuration
  const fetchLinkedDocuments = async () => {
    if (!elevenlabsAgentId) return;

    setLoadingLinkedDocs(true);
    try {
      const response = await fetch(
        `/api/elevenlabs-agent/details/${elevenlabsAgentId}`,
      );
      if (response.ok) {
        const data = await response.json();
        const agentConfig = data.data;

        // Extract knowledge base from agent configuration
        const knowledgeBase =
          agentConfig?.conversation_config?.agent?.prompt?.knowledge_base;

        if (knowledgeBase && Array.isArray(knowledgeBase)) {
          setLinkedDocuments(knowledgeBase);
        } else {
          setLinkedDocuments([]);
        }
      } else {
        console.error('Failed to fetch agent details');
        setLinkedDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching linked documents:', error);
      setLinkedDocuments([]);
    } finally {
      setLoadingLinkedDocs(false);
    }
  };

  // Check if a document is linked to the agent
  const isDocumentLinked = (docId: string) => {
    return linkedDocuments.some((doc) => doc.id === docId);
  };

  // Get linked document info
  const getLinkedDocumentInfo = (docId: string) => {
    return linkedDocuments.find((doc) => doc.id === docId);
  };

  // Check if a document is being unlinked
  const isDocumentUnlinking = (docId: string) => {
    return unlinkingDocs.includes(docId);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        cancelDelete();
      }
    };

    if (showDeleteConfirm) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDeleteConfirm]);

  // Fetch linked documents when component mounts or agent ID changes
  useEffect(() => {
    if (elevenlabsAgentId) {
      fetchLinkedDocuments();
    }
  }, [elevenlabsAgentId]);

  // Auto-select linked documents when they are loaded
  useEffect(() => {
    if (linkedDocuments.length > 0) {
      const linkedDocIds = linkedDocuments.map((doc) => doc.id);
      setSelectedDocs(linkedDocIds);
    }
  }, [linkedDocuments]);

  // Add new document
  const addDocument = async () => {
    if (!documentName.trim()) {
      return;
    }

    if (documentType === 'url' && !documentUrl.trim()) {
      return;
    }

    if (documentType === 'text' && !documentText.trim()) {
      return;
    }

    if (documentType === 'file' && !selectedFile) {
      return;
    }

    setUploading(true);
    try {
      if (documentType === 'file' && selectedFile) {
        await uploadFileHook({
          file: selectedFile,
          name: documentName,
        });
      } else {
        const payload: Record<string, unknown> = {
          type: documentType,
          name: documentName,
        };

        if (documentType === 'url') {
          payload.url = documentUrl;
        } else if (documentType === 'text') {
          payload.text = documentText;
        }

        await addDocumentHook(payload as unknown as CreateDocumentRequest);
      }

      // Auto-link knowledge base to agent
      console.log('Document added successfully, now auto-linking to agent...');
      await linkKnowledgeBaseToAgent();

      // Refresh linked documents after linking
      await fetchLinkedDocuments();

      // Reset form
      setShowAddForm(false);
      setDocumentName('');
      setDocumentUrl('');
      setDocumentText('');
      setSelectedFile(null);
      setDocumentType('url');
    } catch (error) {
      console.error('Error adding document:', error);
      // Error is already handled by the hook with toast notifications
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string) => {
    setDeletingDocument(true);
    try {
      await deleteDocumentHook(documentId);
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);

      // Refresh linked documents after deletion
      await fetchLinkedDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setDeletingDocument(false);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (doc: {
    id: string;
    name: string;
    type: string;
  }) => {
    setDocumentToDelete(doc);
    setShowDeleteConfirm(true);
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDocumentToDelete(null);
  };

  // Auto-link knowledge base to agent
  const linkKnowledgeBaseToAgent = async () => {
    console.log('Auto-linking knowledge base to agent...', {
      elevenlabsAgentId,
    });

    if (!elevenlabsAgentId) {
      console.log('No ElevenLabs agent ID found, skipping auto-link');
      return;
    }

    try {
      // Get all knowledge base documents
      const kbResponse = await fetch('/api/elevenlabs-agent/knowledge-base');
      if (!kbResponse.ok) {
        console.error('Failed to fetch knowledge base for auto-linking');
        return;
      }
      const kbData = await kbResponse.json();
      const documents = kbData.data?.documents || [];

      if (documents.length === 0) {
        console.log('No documents found for auto-linking');
        return;
      }

      // Extract document IDs
      const knowledgeBaseIds = documents.map((doc: { id: string }) => doc.id);

      // Link to agent
      const updateResponse = await fetch('/api/elevenlabs-agent/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: elevenlabsAgentId,
          knowledge_base_ids: knowledgeBaseIds,
        }),
      });

      if (updateResponse.ok) {
        console.log(
          `Auto-linked ${knowledgeBaseIds.length} documents to agent`,
        );
        // Show a subtle toast notification
        const { toast } = await import('sonner');
        toast.success(`Document added and linked to agent automatically!`);
      } else {
        const errorData = await updateResponse.json().catch(() => ({}));
        console.error('Failed to auto-link knowledge base to agent:', {
          status: updateResponse.status,
          statusText: updateResponse.statusText,
          errorData,
        });
      }
    } catch (error) {
      console.error('Error auto-linking knowledge base:', error);
    }
  };

  // Helper: toggle selection
  const toggleDocSelection = (docId: string) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };
  const isDocSelected = (docId: string) => selectedDocs.includes(docId);

  // Link selected knowledge base documents to agent
  const linkSelectedKnowledgeBaseToAgent = async () => {
    if (!elevenlabsAgentId) return;
    const selected = documents.filter((doc) => selectedDocs.includes(doc.id));
    if (selected.length === 0) {
      const { toast } = await import('sonner');
      toast.error('Please select at least one document to link.');
      return;
    }

    setLinkingDocs(true);
    try {
      // Build correct KB object array
      const kbObjects = selected.map((doc) => {
        const base = { id: doc.id, type: doc.type, name: doc.name };
        return 'usage_mode' in doc
          ? { ...base, usage_mode: (doc as KnowledgeDocument).usage_mode }
          : base;
      });

      const response = await fetch('/api/elevenlabs-agent/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: elevenlabsAgentId,
          knowledge_base_objects: kbObjects,
        }),
      });

      const { toast } = await import('sonner');
      if (response.ok) {
        toast.success('Linked selected documents to agent!');
        // Refresh linked documents after linking
        await fetchLinkedDocuments();
        // Clear selection after successful linking
        setSelectedDocs([]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          'Failed to link documents: ' +
            (errorData?.error || response.statusText),
        );
      }
    } catch (error) {
      const { toast } = await import('sonner');
      toast.error(
        'Failed to link documents: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setLinkingDocs(false);
    }
  };

  // Unlink a single document from agent
  const unlinkDocument = async (docId: string) => {
    if (!elevenlabsAgentId) return;

    setUnlinkingDocs((prev) => [...prev, docId]);
    try {
      // Get current linked documents excluding the one to unlink
      const remainingLinkedDocs = linkedDocuments.filter(
        (doc) => doc.id !== docId,
      );

      const response = await fetch('/api/elevenlabs-agent/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: elevenlabsAgentId,
          knowledge_base_objects: remainingLinkedDocs,
        }),
      });

      const { toast } = await import('sonner');
      if (response.ok) {
        toast.success('Document unlinked from agent!');
        // Refresh linked documents after unlinking
        await fetchLinkedDocuments();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(
          'Failed to unlink document: ' +
            (errorData?.error || response.statusText),
        );
      }
    } catch (error) {
      const { toast } = await import('sonner');
      toast.error(
        'Failed to unlink document: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    } finally {
      setUnlinkingDocs((prev) => prev.filter((id) => id !== docId));
    }
  };

  // Get document type icon component
  const getDocumentTypeIconComponent = (type: string) => {
    switch (type) {
      case 'url':
        return <Globe className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'file':
        return <Upload className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (!elevenlabsAgentId) {
    return (
      <div className="rounded-xl border p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Knowledge Base</h3>
              <p className="text-muted-foreground text-sm">
                No ElevenLabs agent ID found. Please ensure the agent is
                properly configured.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-xl border p-6 shadow-sm">
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Knowledge Base</h3>
                  <p className="text-muted-foreground text-sm">
                    Manage knowledge documents that your agent can access during
                    conversations
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-current"></div>
                <p className="text-muted-foreground text-sm">
                  Loading documents...
                </p>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No documents yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Add knowledge documents to help your agent provide better
                responses
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const isLinked = isDocumentLinked(doc.id);
                const linkedInfo = getLinkedDocumentInfo(doc.id);
                const isUnlinking = isDocumentUnlinking(doc.id);

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isDocSelected(doc.id)}
                        onChange={() => toggleDocSelection(doc.id)}
                        className="h-4 w-4 rounded border-2 focus:ring-2 focus:ring-offset-2"
                        aria-label={`Select ${doc.name}`}
                        disabled={isUnlinking}
                      />
                      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                        {getDocumentTypeIconComponent(doc.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{doc.name}</h4>
                          {isLinked && (
                            <div className="flex items-center gap-1">
                              <Badge variant="default">Linked</Badge>
                              {linkedInfo?.usage_mode && (
                                <Badge variant="outline" className="text-xs">
                                  {linkedInfo.usage_mode}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Badge variant="outline">{doc.type}</Badge>
                          {doc.metadata && (
                            <>
                              <span>•</span>
                              <span>
                                {formatFileSize(doc.metadata.size_bytes)}
                              </span>
                              <span>•</span>
                              <span>
                                Created{' '}
                                {formatDate(doc.metadata.created_at_unix_secs)}
                              </span>
                            </>
                          )}
                          {linkedInfo?.usage_mode && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                Mode: {linkedInfo.usage_mode}
                              </Badge>
                            </>
                          )}
                        </div>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                          >
                            {doc.url}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLinked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unlinkDocument(doc.id)}
                          disabled={isUnlinking}
                        >
                          {isUnlinking ? (
                            <>
                              <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                              Unlinking...
                            </>
                          ) : (
                            <>
                              <Link className="mr-1 h-3 w-3" />
                              Unlink
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showDeleteConfirmation(doc)}
                        disabled={isUnlinking}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="text-muted-foreground px-2 text-sm">
              {loadingLinkedDocs ? (
                <span>Checking linked documents...</span>
              ) : (
                <span>
                  {linkedDocuments.length} of {documents.length} documents
                  linked
                </span>
              )}
            </div>
            <Button
              onClick={linkSelectedKnowledgeBaseToAgent}
              disabled={selectedDocs.length === 0 || linkingDocs}
            >
              {linkingDocs ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  Linking...
                </>
              ) : (
                'Link Selected'
              )}
            </Button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Add Knowledge Document
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="documentType">Document Type</Label>
                <Select
                  value={documentType}
                  onValueChange={(value: 'url' | 'text' | 'file') =>
                    setDocumentType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">URL (Web Page)</SelectItem>
                    <SelectItem value="text">Text Content</SelectItem>
                    <SelectItem value="file">File Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="documentName">Document Name</Label>
                <Input
                  id="documentName"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                />
              </div>

              {documentType === 'url' && (
                <div>
                  <Label htmlFor="documentUrl">URL</Label>
                  <Input
                    id="documentUrl"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {documentType === 'text' && (
                <div>
                  <Label htmlFor="documentText">Text Content</Label>
                  <Textarea
                    id="documentText"
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                    placeholder="Enter the text content..."
                    rows={6}
                  />
                </div>
              )}

              {documentType === 'file' && (
                <div className="space-y-4">
                  <div className="rounded-lg border-2 border-dashed p-6 text-center">
                    <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground mb-2 text-sm">
                      Upload a file to add to your knowledge base
                    </p>
                    <p className="text-muted-foreground mb-4 text-xs">
                      Supported: PDF, DOCX, TXT, HTML, EPUB (max 10MB)
                    </p>
                    <p className="text-muted-foreground mb-2 text-xs">
                      Note: Some PDF files may not upload successfully. If you
                      encounter issues, try converting to TXT or use a different
                      file format.
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.html,.epub"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          if (!documentName.trim()) {
                            setDocumentName(file.name);
                          }
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="hover:bg-muted cursor-pointer rounded-md px-4 py-2 text-sm font-medium"
                    >
                      Choose File
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">
                          File selected: {selectedFile?.name || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Size:{' '}
                        {selectedFile
                          ? (selectedFile.size / 1024 / 1024).toFixed(2)
                          : '0'}{' '}
                        MB
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setDocumentName('');
                  setDocumentUrl('');
                  setDocumentText('');
                  setSelectedFile(null);
                  setDocumentType('url');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={addDocument}
                disabled={
                  uploading ||
                  (documentType === 'url' && !documentUrl.trim()) ||
                  (documentType === 'text' && !documentText.trim()) ||
                  !documentName.trim()
                }
              >
                {uploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    Adding...
                  </>
                ) : (
                  'Add Document'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Delete Knowledge Document
                </h3>
                <p className="text-muted-foreground text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                  {getDocumentTypeIconComponent(documentToDelete!.type)}
                </div>
                <div>
                  <h4 className="font-medium">{documentToDelete!.name}</h4>
                  <p className="text-muted-foreground text-sm">
                    Type: {documentToDelete!.type}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={deletingDocument}
                className="order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteDocument(documentToDelete!.id)}
                disabled={deletingDocument}
                className="order-1 sm:order-2"
              >
                {deletingDocument ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Document
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
