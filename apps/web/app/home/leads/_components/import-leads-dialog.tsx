'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Download } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Alert, AlertDescription } from '@kit/ui/alert';
import { Label } from '@kit/ui/label';

interface ImportLeadsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportLeadsDialog({ open, onOpenChange }: ImportLeadsDialogProps) {
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    // TODO: Implement CSV parsing and import
    setTimeout(() => {
      setImporting(false);
      setSelectedFile(null);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import your leads
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Leads from integrations like Salesforce and HubSpot are automatically synced.
              Use CSV import for leads from other sources.
            </AlertDescription>
          </Alert>

          {/* CSV Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 transition-colors hover:border-muted-foreground/50">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <Label htmlFor="csv-upload">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {selectedFile ? selectedFile.name : 'Choose a CSV file'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Required columns: first_name, last_name, email, phone
                    </p>
                  </div>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvImport}
                  />
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {selectedFile ? 'Change File' : 'Select File'}
                    </span>
                  </Button>
                </Label>
              </div>
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">
                  Download our CSV template with the correct format
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/templates/leads-template.csv" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || importing}
            >
              {importing ? 'Importing...' : 'Import Leads'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
