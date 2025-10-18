'use client';

import { useState } from 'react';

import { Upload } from 'lucide-react';

import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import { useBulkCreateLeads } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { type LeadCSVRow, LeadCSVUploader } from '@kit/ui/henk/csv-uploader';

interface CSVUploadProps {
  campaignId: string;
  onSuccess?: () => void;
}

export function CSVUpload({ campaignId, onSuccess }: CSVUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const bulkCreateLeadsMutation = useBulkCreateLeads();
  const { data: businessContext } = useBusinessContext();

  const handleUpload = async (leads: LeadCSVRow[]) => {
    if (!businessContext?.business_id) {
      return {
        success: false,
        message: 'Business context not loaded. Please try again.',
      };
    }

    try {
      const leadsData = leads.map((lead) => {
        const nameParts = lead.name.trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';

        return {
          business_id: businessContext.business_id,
          first_name,
          last_name,
          phone: lead.phone.trim(),
          email: lead.email?.trim() || null,
          company: lead.company?.trim() || null,
          timezone: lead.timezone?.trim() || 'UTC',
          status: 'new' as const,
          attempts: 0,
        };
      });

      console.log(
        'Uploading leads:',
        leadsData.length,
        'leads to campaign:',
        campaignId,
      );

      const result = await bulkCreateLeadsMutation.mutateAsync({
        business_id: businessContext.business_id,
        leads: leadsData,
      });

      console.log('Upload result:', result);

      // Close dialog and trigger success callback
      setTimeout(() => {
        setIsOpen(false);
        onSuccess?.();
      }, 2000);

      return {
        success: true,
        message: `Successfully uploaded ${result.length} leads to the database`,
        count: result.length,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to upload leads. Please try again.',
      };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your leads data. The system will
            automatically validate and process your data with comprehensive
            error handling.
          </DialogDescription>
        </DialogHeader>

        <LeadCSVUploader onUpload={handleUpload} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}
