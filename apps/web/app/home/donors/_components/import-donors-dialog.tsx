'use client';

import { useState } from 'react';
import { Upload, Database, FileSpreadsheet, AlertCircle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Alert, AlertDescription } from '@kit/ui/alert';

interface ImportDonorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDonorsDialog({ open, onOpenChange }: ImportDonorsDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleSalesforceImport = async () => {
    setImporting(true);
    // TODO: Implement Salesforce sync
    setTimeout(() => {
      setImporting(false);
      onOpenChange(false);
    }, 2000);
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    // TODO: Implement CSV parsing and import
    setTimeout(() => {
      setImporting(false);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Donors</DialogTitle>
          <DialogDescription>
            Choose how you&apos;d like to import your donors
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Salesforce Import */}
          <Card
            className={`cursor-pointer transition-colors hover:border-primary ${
              selectedMethod === 'salesforce' ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedMethod('salesforce')}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Salesforce</CardTitle>
                  <CardDescription>
                    Sync donors from your connected Salesforce account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {selectedMethod === 'salesforce' && (
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    This will import all donors from your Salesforce account. Existing donors will be updated based on their Salesforce ID.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMethod(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSalesforceImport}
                    disabled={importing}
                  >
                    {importing ? 'Importing...' : 'Start Import'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* CSV Import */}
          <Card
            className={`cursor-pointer transition-colors hover:border-primary ${
              selectedMethod === 'csv' ? 'border-primary' : ''
            }`}
            onClick={() => setSelectedMethod('csv')}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">CSV File</CardTitle>
                  <CardDescription>
                    Upload a CSV file with your donor data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {selectedMethod === 'csv' && (
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    CSV should include columns: first_name, last_name, email, phone, company. <a href="/templates/contacts.csv" className="underline">Download template</a>
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMethod(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button asChild>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                      <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleCsvImport}
                      />
                    </label>
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* HubSpot Import - Coming Soon */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                  <Database className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">HubSpot</CardTitle>
                  <CardDescription>
                    Coming soon - Sync from HubSpot CRM
                  </CardDescription>
                </div>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
            </CardHeader>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
