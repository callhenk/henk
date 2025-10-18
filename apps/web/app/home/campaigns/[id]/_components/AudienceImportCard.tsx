'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import { useBulkCreateLeads } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { type LeadCSVRow, LeadCSVUploader } from '@kit/ui/henk/csv-uploader';

interface AudienceImportCardProps {
  onSuccess?: () => void;
}

/**
 * Enhanced Audience Import Card using the reusable CSV uploader system
 * Replaces the original complex implementation with the new modular components
 */
export function AudienceImportCard({ onSuccess }: AudienceImportCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const bulkCreateLeads = useBulkCreateLeads();
  const { data: businessContext } = useBusinessContext();

  const handleUpload = async (data: LeadCSVRow[]) => {
    if (!businessContext?.business_id) {
      toast.error('Business context not loaded. Please try again.');
      return {
        success: false,
        message: 'Business context not loaded. Please try again.',
      };
    }

    setIsUploading(true);

    try {
      // Transform data to the expected format for database
      const transformedData = data.map((row) => {
        // Split name into first_name and last_name
        const nameParts = String(row.name || '')
          .trim()
          .split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';

        return {
          business_id: businessContext.business_id,
          first_name,
          last_name,
          phone: String(row.phone || '').trim(),
          email: row.email ? String(row.email).trim() : null,
          company: row.company ? String(row.company).trim() : null,
          status: (row.status ? String(row.status).trim() : 'new') as
            | 'new'
            | 'queued'
            | 'in_progress'
            | 'contacted'
            | 'unreachable'
            | 'bad_number'
            | 'do_not_call'
            | 'pledged'
            | 'donated'
            | 'completed',
          attempts: row.attempts ? Math.max(0, Number(row.attempts) || 0) : 0,
          pledged_amount: row.pledged_amount
            ? Math.max(0, Number(row.pledged_amount) || 0)
            : null,
          donated_amount: row.donated_amount
            ? Math.max(0, Number(row.donated_amount) || 0)
            : null,
          last_contact_date: row.last_contact_date
            ? String(row.last_contact_date).trim()
            : null,
          notes: row.notes ? String(row.notes).trim() : null,
        };
      });

      // Upload to database
      const result = await bulkCreateLeads.mutateAsync({
        business_id: businessContext.business_id,
        leads: transformedData,
      });

      toast.success(
        `Successfully imported ${result.length} leads to the campaign`,
      );

      if (onSuccess) {
        onSuccess();
      }

      return {
        success: true,
        message: `Successfully imported ${result.length} leads to the campaign`,
        count: result.length,
      };
    } catch (error) {
      console.error('Audience import error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to import audience. Please try again.';
      toast.error(errorMessage);

      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Audience</CardTitle>
      </CardHeader>
      <CardContent>
        <LeadCSVUploader
          onUpload={handleUpload}
          onSuccess={onSuccess}
          disabled={isUploading}
          className="space-y-6"
        />
      </CardContent>
    </Card>
  );
}

export default AudienceImportCard;
