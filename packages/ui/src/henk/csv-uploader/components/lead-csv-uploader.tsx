'use client';

import type { ValidationError } from '../types';
import { CSVUploader } from './csv-uploader';

export interface LeadCSVRow {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status?: string;
  attempts?: number;
  pledged_amount?: number;
  donated_amount?: number;
  last_contact_date?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface LeadCSVUploaderProps {
  onUpload: (
    leads: LeadCSVRow[],
  ) => Promise<{ success: boolean; message: string; count?: number }>;
  onSuccess?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Specialized CSV uploader for lead data
 */
export function LeadCSVUploader({
  onUpload,
  onSuccess,
  className,
  disabled,
}: LeadCSVUploaderProps) {
  const validateLeadData = (data: LeadCSVRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index is 0-based and we skip header

      // Validate required fields
      if (!row.name || String(row.name).trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'name',
          message: 'Name is required',
          severity: 'error',
        });
      }

      if (!row.phone || String(row.phone).trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'phone',
          message: 'Phone number is required',
          severity: 'error',
        });
      }

      // Additional lead-specific validations can be added here
      if (row.email && String(row.email).trim()) {
        const email = String(row.email).trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push({
            row: rowNumber,
            field: 'email',
            message: 'Invalid email format',
            severity: 'warning',
          });
        }
      }
    });

    return errors;
  };

  const handleUpload = async (data: LeadCSVRow[]) => {
    // Transform data to the expected format
    const transformedData = data.map((row) => ({
      name: String(row.name || '').trim(),
      phone: String(row.phone || '').trim(),
      email: row.email ? String(row.email).trim() : undefined,
      company: row.company ? String(row.company).trim() : undefined,
      status: row.status ? String(row.status).trim() : undefined,
      attempts: row.attempts ? Number(row.attempts) || 0 : undefined,
      pledged_amount: row.pledged_amount ? Number(row.pledged_amount) || 0 : undefined,
      donated_amount: row.donated_amount ? Number(row.donated_amount) || 0 : undefined,
      last_contact_date: row.last_contact_date ? String(row.last_contact_date).trim() : undefined,
      notes: row.notes ? String(row.notes).trim() : undefined,
    }));

    const result = await onUpload(transformedData);

    if (result.success && onSuccess) {
      setTimeout(onSuccess, 2000);
    }

    return result;
  };

  return (
    <CSVUploader<LeadCSVRow>
      config={{
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxRows: 50000,
        parseTimeout: 30000,
        enableDeduplication: true,
        requiredFields: ['name', 'phone'],
        optionalFields: ['email', 'company', 'status', 'attempts', 'pledged_amount', 'donated_amount', 'last_contact_date', 'notes'],
        fieldMappings: {
          name: ['name', 'full_name', 'Full Name', 'Name'],
          phone: [
            'phone',
            'phone_number',
            'Phone Number',
            'Phone',
            'mobile',
            'Mobile',
          ],
          email: ['email', 'e-mail', 'Email', 'E-mail'],
          company: ['company', 'organization', 'Company', 'Organization'],
          status: ['status', 'Status'],
          attempts: ['attempts', 'Attempts'],
          pledged_amount: ['pledged_amount', 'pledged', 'Pledged', 'Pledged Amount'],
          donated_amount: ['donated_amount', 'donated', 'Donated', 'Donated Amount'],
          last_contact_date: ['last_contact_date', 'last_contact', 'Last Contact', 'Last Contact Date'],
          notes: ['notes', 'Notes', 'note', 'Note'],
        },
      }}
      onUpload={handleUpload}
      onValidate={validateLeadData}
      className={className}
      disabled={disabled}
    />
  );
}
