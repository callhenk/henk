'use client';

import { Download, FileSpreadsheet, FileText, Image } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

interface ExportControlsProps {
  filters: {
    campaignId?: string;
    agentId?: string;
    outcomeType?: 'pledged' | 'callback' | 'not_interested';
    dateRange: {
      startDate: Date;
      endDate: Date;
      preset?: '7d' | '30d' | '90d' | 'thisMonth' | 'custom';
    };
  };
}

const exportFormats = [
  {
    value: 'csv',
    label: 'CSV',
    icon: FileSpreadsheet,
    description: 'Spreadsheet format',
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: FileText,
    description: 'Printable report',
  },
  { value: 'png', label: 'PNG', icon: Image, description: 'Chart images' },
];

const exportTypes = [
  {
    value: 'summary',
    label: 'Summary Report',
    description: 'Key metrics and insights',
  },
  {
    value: 'detailed',
    label: 'Detailed Report',
    description: 'Complete call logs and data',
  },
  {
    value: 'charts',
    label: 'Charts Only',
    description: 'Visual charts and graphs',
  },
];

export function ExportControls({ filters }: ExportControlsProps) {
  const handleExport = (format: string, type: string) => {
    // In a real implementation, this would trigger the export
    console.log(`Exporting ${type} as ${format} with filters:`, filters);

    // Mock export - would be replaced with actual API call
    const link = document.createElement('a');
    link.href =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        'Date,Calls,Conversions,Revenue\n2024-01-01,45,12,1200\n2024-01-02,52,15,1800',
      );
    link.download = `analytics-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
  };

  return (
    <Card className={'glass-panel'}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <CardTitle>Export Analytics</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Export Options */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div>{format.label}</div>
                            <div className="text-muted-foreground text-xs">
                              {format.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select defaultValue="summary">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div>{type.label}</div>
                        <div className="text-muted-foreground text-xs">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Export Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv', 'summary')}
              className="flex items-center space-x-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export Summary CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf', 'detailed')}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Export Full Report</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('png', 'charts')}
              className="flex items-center space-x-2"
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-4 w-4" />
              <span>Export Charts</span>
            </Button>
          </div>

          {/* Export Info */}
          <div className="bg-muted rounded-lg p-3">
            <h4 className="mb-1 text-sm font-medium">Export Information</h4>
            <div className="text-muted-foreground space-y-1 text-xs">
              <div>
                • Date range: {filters.dateRange.startDate.toLocaleDateString()}{' '}
                - {filters.dateRange.endDate.toLocaleDateString()}
              </div>
              <div>
                • Filters applied:{' '}
                {
                  Object.entries(filters).filter(
                    ([k, v]) => k !== 'dateRange' && v,
                  ).length
                }{' '}
                active filters
              </div>
              <div>• Estimated file size: 2-5 MB for detailed reports</div>
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="border-t pt-4">
            <h4 className="mb-2 text-sm font-medium">Scheduled Reports</h4>
            <div className="text-muted-foreground mb-3 text-xs">
              Set up automatic weekly or monthly reports delivered to your
              email.
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Configure Scheduled Reports
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
