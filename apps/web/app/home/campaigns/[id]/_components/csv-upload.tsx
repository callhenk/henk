'use client';

import { useState } from 'react';

import {
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  FileText,
  Upload,
  X,
} from 'lucide-react';
import Papa from 'papaparse';

import { useBulkCreateLeads } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';

interface CSVUploadProps {
  campaignId: string;
  onSuccess?: () => void;
}

interface CSVLead {
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function CSVUpload({ campaignId, onSuccess }: CSVUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVLead[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const bulkCreateLeadsMutation = useBulkCreateLeads();

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation - allows various formats
    const phoneRegex = /^[+]?[1-9]\d{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCSVData = (data: CSVLead[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index is 0-based and we skip header

      // Check required fields
      if (!row.name || row.name.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'name',
          message: 'Name is required',
        });
      }

      if (!row.phone || row.phone.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'phone',
          message: 'Phone number is required',
        });
      } else if (!validatePhone(row.phone)) {
        errors.push({
          row: rowNumber,
          field: 'phone',
          message: 'Invalid phone number format',
        });
      }

      // Check optional fields
      if (row.email && row.email.trim() !== '' && !validateEmail(row.email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Invalid email format',
        });
      }
    });

    return errors;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !== 'text/csv' &&
      !selectedFile.name.endsWith('.csv')
    ) {
      alert('Please select a valid CSV file');
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);
    setUploadResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVLead[];
        const errors = validateCSVData(data);

        setValidationErrors(errors);
        setParsedData(data);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file. Please check the file format.');
      },
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (droppedFile.type !== 'text/csv' && !droppedFile.name.endsWith('.csv')) {
      alert('Please select a valid CSV file');
      return;
    }

    setFile(droppedFile);
    setValidationErrors([]);
    setUploadResult(null);

    Papa.parse(droppedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVLead[];
        const errors = validateCSVData(data);

        setValidationErrors(errors);
        setParsedData(data);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file. Please check the file format.');
      },
    });
  };

  const handleUpload = async () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before uploading');
      return;
    }

    if (parsedData.length === 0) {
      alert('No valid data to upload');
      return;
    }

    setIsUploading(true);

    try {
      const leadsData = parsedData.map((lead) => ({
        name: lead.name.trim(),
        phone: lead.phone.trim(),
        email: lead.email?.trim() || null,
        company: lead.company?.trim() || null,
        status: 'new' as const,
        attempts: 0,
      }));

      console.log(
        'Uploading leads:',
        leadsData.length,
        'leads to campaign:',
        campaignId,
      );

      const result = await bulkCreateLeadsMutation.mutateAsync({
        campaign_id: campaignId,
        leads: leadsData,
      });

      console.log('Upload result:', result);

      setUploadResult({
        success: true,
        message: `Successfully uploaded ${result.length} leads to the database`,
        count: result.length,
      });

      // Reset form
      setFile(null);
      setParsedData([]);
      setValidationErrors([]);

      // Close dialog after a delay
      setTimeout(() => {
        setIsOpen(false);
        setUploadResult(null);
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to upload leads. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      'name,phone,email,company\nJohn Doe,+1234567890,john@example.com,Acme Corp\nJane Smith,+1987654321,jane@example.com,XYZ Inc';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your leads data. The file should include the
            required columns: name, phone, email (optional), and company
            (optional).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">CSV Format Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p className="font-medium">Required columns:</p>
                <ul className="text-muted-foreground list-inside list-disc space-y-1">
                  <li>
                    <strong>name</strong> - Full name of the lead
                  </li>
                  <li>
                    <strong>phone</strong> - Phone number (various formats
                    accepted)
                  </li>
                </ul>
                <p className="mt-3 font-medium">Optional columns:</p>
                <ul className="text-muted-foreground list-inside list-disc space-y-1">
                  <li>
                    <strong>email</strong> - Email address
                  </li>
                  <li>
                    <strong>company</strong> - Company name
                  </li>
                </ul>
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>

              {/* Modern File Upload Area */}
              <div
                className={`mt-2 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="csv-file" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <FileSpreadsheet className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">
                          {file.name}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                          setParsedData([]);
                          setValidationErrors([]);
                          setUploadResult(null);
                        }}
                        className="mt-2"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="text-muted-foreground mx-auto h-12 w-12" />
                      <div>
                        <p className="text-lg font-medium">
                          Click to browse files
                        </p>
                        <p className="text-muted-foreground text-sm">
                          or drag and drop your CSV file here
                        </p>
                      </div>
                      <div className="text-muted-foreground space-y-1 text-xs">
                        <p>Supported format: CSV only</p>
                        <p>Maximum file size: 10MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Preview */}
            {parsedData.length > 0 && (
              <div>
                <Label>Preview ({parsedData.length} leads)</Label>
                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Phone</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Company</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((lead, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{lead.name}</td>
                          <td className="p-2">{lead.phone}</td>
                          <td className="p-2">{lead.email || '-'}</td>
                          <td className="p-2">{lead.company || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 5 && (
                    <div className="text-muted-foreground p-2 text-center text-sm">
                      ... and {parsedData.length - 5} more rows
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Validation Errors:</p>
                    <ul className="space-y-1 text-sm">
                      {validationErrors.slice(0, 5).map((error, index) => (
                        <li key={index}>
                          Row {error.row}: {error.field} - {error.message}
                        </li>
                      ))}
                    </ul>
                    {validationErrors.length > 5 && (
                      <p className="text-sm">
                        ... and {validationErrors.length - 5} more errors
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <AlertDescription>{uploadResult.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                isUploading ||
                !file ||
                parsedData.length === 0 ||
                validationErrors.length > 0
              }
            >
              {isUploading ? 'Uploading...' : 'Upload Leads'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
