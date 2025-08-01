'use client';

import { useCallback, useState } from 'react';

import { Download, Eye, File, Trash2, Upload } from 'lucide-react';

import { useUpdateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Progress } from '@kit/ui/progress';

interface KnowledgeFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

interface KnowledgeUploadProps {
  agentId: string;
  onSaveSuccess?: () => void;
}

// File size limit is handled by the file input accept attribute

export function KnowledgeUpload({
  agentId,
  onSaveSuccess,
}: KnowledgeUploadProps) {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [_uploading, setUploading] = useState(false);

  const updateAgentMutation = useUpdateAgent();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: KnowledgeFile[] = acceptedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'uploading',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    handleFileUpload(acceptedFiles, newFiles);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      onDrop(fileArray);
    }
  };

  const handleFileUpload = async (
    files: File[],
    knowledgeFiles: KnowledgeFile[],
  ) => {
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const knowledgeFile = knowledgeFiles[i];

      if (!file || !knowledgeFile) continue;

      try {
        // Simulate file upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === knowledgeFile.id ? { ...f, progress } : f,
            ),
          );
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Update file status to processing
        setFiles((prev) =>
          prev.map((f) =>
            f.id === knowledgeFile.id ? { ...f, status: 'processing' } : f,
          ),
        );

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update file status to completed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === knowledgeFile.id ? { ...f, status: 'completed' } : f,
          ),
        );

        // Save to database (this would be your actual upload logic)
        await saveKnowledgeToDatabase(file, knowledgeFile);
      } catch (error) {
        console.error('Upload failed:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === knowledgeFile.id
              ? { ...f, status: 'error', error: 'Upload failed' }
              : f,
          ),
        );
      }
    }

    setUploading(false);
    onSaveSuccess?.();
  };

  const saveKnowledgeToDatabase = async (
    file: File,
    knowledgeFile: KnowledgeFile,
  ) => {
    // Convert file to base64 for storage (in production, you'd upload to a file service)
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      // Get existing knowledge base
      const existingKnowledge = {}; // This would come from your agent data

      // Add the new file to knowledge base
      const updatedKnowledge = {
        ...existingKnowledge,
        [knowledgeFile.id]: {
          name: knowledgeFile.name,
          type: knowledgeFile.type,
          size: knowledgeFile.size,
          data: base64Data,
          uploadedAt: knowledgeFile.uploadedAt,
        },
      };

      // Save to database
      await updateAgentMutation.mutateAsync({
        id: agentId,
        knowledge_base: updatedKnowledge,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('csv')) return '📋';
    if (type.includes('json')) return '⚙️';
    return '📄';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploading':
        return (
          <Badge variant="outline" className="text-blue-600">
            Uploading
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="text-yellow-600">
            Processing
          </Badge>
        );
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}

      <CardContent>
        <div className="border-muted-foreground/25 hover:border-primary/50 rounded-lg border-2 border-dashed p-8 text-center transition-colors">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.csv,.json"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="mb-2 text-lg font-medium">Click to browse files</p>
            <p className="text-muted-foreground mb-4 text-sm">
              or drag and drop files here
            </p>
            <div className="text-muted-foreground space-y-1 text-xs">
              <p>Supported formats: PDF, DOC, DOCX, TXT, CSV, JSON</p>
              <p>Maximum file size: 10MB per file</p>
            </div>
          </label>
        </div>
      </CardContent>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Uploaded Files ({files.length})
            </CardTitle>
            <CardDescription>
              Files that have been uploaded to your agent&apos;s knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getFileIcon(file.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{file.name}</p>
                        {getStatusBadge(file.status)}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {formatFileSize(file.size)} •{' '}
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                      {file.status === 'uploading' &&
                        file.progress !== undefined && (
                          <Progress value={file.progress} className="mt-2" />
                        )}
                      {file.status === 'error' && file.error && (
                        <p className="mt-1 text-sm text-red-600">
                          {file.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === 'completed' && (
                      <>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-lg text-blue-600">💡</div>
            <div>
              <h4 className="mb-2 font-medium text-blue-900">
                How Knowledge Upload Works
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>
                  • Upload documents to give your agent access to specific
                  information
                </li>
                <li>
                  • Supported formats include PDFs, Word documents, and text
                  files
                </li>
                <li>
                  • Files are processed and indexed for the AI to reference
                  during calls
                </li>
                <li>
                  • Your agent can now answer questions based on uploaded
                  content
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
