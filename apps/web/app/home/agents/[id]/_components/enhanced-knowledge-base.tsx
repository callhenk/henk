'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  BookOpen,
  FileText,
  Globe,
  Link,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';

import {
  useFetchAgentKnowledgeBases,
  useLinkKnowledgeBaseToAgent,
  useUnlinkKnowledgeBaseFromAgent,
} from '@kit/supabase/hooks/knowledge-bases/use-knowledge-base-mutations';
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
    autoLoad: true,
  });

  // Knowledge base linking hooks
  const linkKBMutation = useLinkKnowledgeBaseToAgent();
  const unlinkKBMutation = useUnlinkKnowledgeBaseFromAgent();
  const { data: agentKBs = [], isLoading: loadingLinkedDocs } =
    useFetchAgentKnowledgeBases(_agentId);

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
  const [linkingDocs, setLinkingDocs] = useState(false);
  const [unlinkingDocs, setUnlinkingDocs] = useState<string[]>([]);

  // Transform agentKBs into linkedDocuments format (memoized to prevent infinite loop)
  const linkedDocuments: LinkedDocument[] = useMemo(
    () =>
      (agentKBs || []).map(
        (item: { knowledge_bases: { id: string; name: string } }) => {
          const kb = item.knowledge_bases;
          return {
            id: kb.id,
            name: kb.name,
            type: 'knowledge_base',
          };
        },
      ),
    [agentKBs],
  );

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

  // Auto-select linked documents when they are loaded
  // Use JSON.stringify to create a stable dependency that only changes when IDs actually change
  const linkedDocIds = useMemo(
    () => linkedDocuments.map((doc) => doc.id),
    [linkedDocuments],
  );

  useEffect(() => {
    if (linkedDocIds.length > 0) {
      setSelectedDocs(linkedDocIds);
    }
  }, [linkedDocIds]);

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
      let createdDocumentId: string | undefined;

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

        const result = await addDocumentHook(
          payload as unknown as CreateDocumentRequest,
        );
        createdDocumentId = result?.id;
      }

      // Auto-link the newly created knowledge base to agent
      if (_agentId && createdDocumentId) {
        console.log(
          'Document added successfully, now auto-linking to agent...',
          { agent_id: _agentId, knowledge_base_id: createdDocumentId },
        );
        await linkKBMutation.mutateAsync({
          agent_id: _agentId,
          knowledge_base_id: createdDocumentId,
        });
        console.log('Successfully linked knowledge base to agent');
      }

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
    if (!_agentId) return;

    // Filter out already-linked documents
    const selected = documents.filter(
      (doc) => selectedDocs.includes(doc.id) && !isDocumentLinked(doc.id),
    );

    if (selected.length === 0) {
      const { toast } = await import('sonner');

      // Check if all selected docs are already linked
      const alreadyLinked = documents.filter(
        (doc) => selectedDocs.includes(doc.id) && isDocumentLinked(doc.id),
      );

      if (alreadyLinked.length > 0) {
        toast.error('Selected documents are already linked to this agent.');
      } else {
        toast.error('Please select at least one document to link.');
      }
      return;
    }

    setLinkingDocs(true);
    try {
      // Create relationships between agent and selected knowledge bases
      const linkPromises = selected.map((doc) =>
        linkKBMutation.mutateAsync({
          agent_id: _agentId,
          knowledge_base_id: doc.id,
        }),
      );

      await Promise.all(linkPromises);
      const { toast } = await import('sonner');

      toast.success(
        `Linked ${selected.length} document${selected.length > 1 ? 's' : ''} to agent!`,
      );
      // Clear selection after successful linking
      setSelectedDocs([]);
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
    if (!_agentId) return;

    setUnlinkingDocs((prev) => [...prev, docId]);
    try {
      await unlinkKBMutation.mutateAsync({
        agent_id: _agentId,
        knowledge_base_id: docId,
      });

      const { toast } = await import('sonner');
      toast.success('Document unlinked from agent!');
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
      <div className="from-card to-muted/20 rounded-xl border bg-gradient-to-br p-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-4 inline-flex rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
            <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            Voice Settings Required
          </h3>
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            The Knowledge Base is linked to your agent&apos;s voice
            configuration. To enable this feature, please visit the{' '}
            <strong>Voice</strong> tab and save your voice settings first.
          </p>
          <p className="text-muted-foreground text-xs">
            Once voice settings are configured, you&apos;ll be able to add
            documents, web pages, and files to enhance your agent&apos;s
            knowledge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {loading ? (
          <div className="bg-card flex items-center justify-center rounded-xl border p-12">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-muted-foreground text-sm">
                Loading documents...
              </p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="from-card to-muted/20 rounded-xl border bg-gradient-to-br p-12">
            <div className="mx-auto max-w-md text-center">
              <div className="bg-primary/10 mb-4 inline-flex rounded-full p-4">
                <BookOpen className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No documents yet</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Add knowledge documents, web pages, or files to help your agent
                provide more accurate and contextual responses during
                conversations.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Document
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Documents ({documents.length})
                </h3>
                <p className="text-muted-foreground text-sm">
                  {linkedDocuments.length} linked to agent
                </p>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="mr-2 h-3.5 w-3.5" />
                Add Document
              </Button>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => {
                const isLinked = isDocumentLinked(doc.id);
                const _linkedInfo = getLinkedDocumentInfo(doc.id);
                const isUnlinking = isDocumentUnlinking(doc.id);

                return (
                  <div
                    key={doc.id}
                    className={`group flex items-center justify-between rounded-lg border p-3.5 transition-colors ${
                      isDocSelected(doc.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isDocSelected(doc.id)}
                        onChange={() => toggleDocSelection(doc.id)}
                        className="h-4 w-4 rounded border-2 focus:ring-2 focus:ring-offset-2"
                        aria-label={`Select ${doc.name}`}
                        disabled={isUnlinking}
                      />
                      <div className="bg-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg">
                        {getDocumentTypeIconComponent(doc.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="truncate text-sm font-medium">
                            {doc.name}
                          </h4>
                          {isLinked && (
                            <Badge
                              variant="default"
                              className="flex-shrink-0 text-xs"
                            >
                              Linked
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                          {doc.metadata && (
                            <>
                              <span>•</span>
                              <span className="truncate">
                                {formatDate(doc.metadata.created_at_unix_secs)}
                              </span>
                            </>
                          )}
                        </div>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary mt-1 block truncate text-xs hover:underline"
                          >
                            {doc.url}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="ml-3 flex flex-shrink-0 items-center gap-1">
                      {isLinked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => unlinkDocument(doc.id)}
                          disabled={isUnlinking}
                          className="h-8 px-2"
                        >
                          {isUnlinking ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          ) : (
                            <Link className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showDeleteConfirmation(doc)}
                        disabled={isUnlinking}
                        className="text-destructive hover:text-destructive h-8 px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with link action - only show when there are documents */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-sm">
                {loadingLinkedDocs ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Checking linked documents...</span>
                  </div>
                ) : (
                  <span>
                    {selectedDocs.length > 0 && (
                      <span className="text-foreground font-medium">
                        {selectedDocs.length} selected •{' '}
                      </span>
                    )}
                    {linkedDocuments.length} of {documents.length} linked
                  </span>
                )}
              </div>
              {selectedDocs.length > 0 && (
                <Button
                  onClick={linkSelectedKnowledgeBaseToAgent}
                  disabled={
                    selectedDocs.length === 0 ||
                    linkingDocs ||
                    !selectedDocs.some((docId) => !isDocumentLinked(docId))
                  }
                  size="sm"
                  title={
                    selectedDocs.length === 0
                      ? 'Select documents to link'
                      : !selectedDocs.some((docId) => !isDocumentLinked(docId))
                        ? 'Selected documents are already linked'
                        : 'Link selected documents to agent'
                  }
                >
                  {linkingDocs ? (
                    <>
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                      Linking...
                    </>
                  ) : (
                    <>
                      <Link className="mr-2 h-3.5 w-3.5" />
                      Link {selectedDocs.length}{' '}
                      {selectedDocs.length === 1 ? 'Document' : 'Documents'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card text-card-foreground w-full max-w-md rounded-lg p-6">
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
          <div className="bg-card text-card-foreground w-full max-w-md rounded-lg p-4 sm:p-6">
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
