'use client';

import { useState } from 'react';

import { Check, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
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

interface TransferToNumberRule {
  phone_number: string;
  condition: string;
  transfer_type?: 'conference' | 'sip_refer';
  destination_type?: 'phone_number' | 'sip_uri';
}

interface TransferToNumberRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferToNumberRules: { transfers: TransferToNumberRule[] };
  onSave: (transferRules: { transfers: TransferToNumberRule[] }) => Promise<void>;
}

export function TransferToNumberDialog({
  open,
  onOpenChange,
  transferToNumberRules,
  onSave,
}: TransferToNumberRulesDialogProps) {
  const [rules, setRules] = useState<TransferToNumberRule[]>(
    transferToNumberRules.transfers || [],
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRule = () => {
    const newRule: TransferToNumberRule = {
      phone_number: '',
      condition: '',
      transfer_type: 'conference',
      destination_type: 'phone_number',
    };

    setRules([...rules, newRule]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleUpdateRule = (
    index: number,
    field: keyof TransferToNumberRule,
    value: string,
  ) => {
    const updatedRules = [...rules];
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: value,
    } as TransferToNumberRule;
    setRules(updatedRules);
  };

  const handleSave = async () => {
    // Validate rules
    const invalidRules = rules.filter(
      (rule) => !rule.phone_number || !rule.condition,
    );

    if (invalidRules.length > 0) {
      toast.error('Please fill in all required fields (phone number and condition)');
      return;
    }

    // Validate phone numbers
    const invalidPhoneNumbers = rules.filter((rule) => {
      const isPhoneNumber = rule.destination_type === 'phone_number';
      if (isPhoneNumber) {
        // Basic phone number validation (E.164 format)
        return !/^\+[1-9]\d{1,14}$/.test(rule.phone_number);
      }
      return false;
    });

    if (invalidPhoneNumbers.length > 0) {
      toast.error('Please enter valid phone numbers in E.164 format (e.g., +15551234567)');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ transfers: rules });
      toast.success('Transfer rules saved successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save transfer rules:', error);
      toast.error('Failed to save transfer rules');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset rules to original state
    setRules(transferToNumberRules.transfers || []);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Transfer to Number</DialogTitle>
          <DialogDescription>
            Set up rules for transferring calls to phone numbers or SIP URIs when specific conditions are met.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm mb-4">
                No transfer rules configured yet.
              </p>
              <Button onClick={handleAddRule} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>
          ) : (
            <>
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-4 bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Rule {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRule(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {/* Transfer Type */}
                    <div className="space-y-2">
                      <Label>Transfer Type</Label>
                      <Select
                        value={rule.transfer_type || 'conference'}
                        onValueChange={(value) =>
                          handleUpdateRule(index, 'transfer_type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transfer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="sip_refer">
                            SIP REFER
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Conference: Default method. SIP REFER: Direct transfer (SIP only).
                      </p>
                    </div>

                    {/* Destination Type */}
                    <div className="space-y-2">
                      <Label>Destination Type</Label>
                      <Select
                        value={rule.destination_type || 'phone_number'}
                        onValueChange={(value) =>
                          handleUpdateRule(index, 'destination_type', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone_number">Phone Number</SelectItem>
                          <SelectItem value="sip_uri">SIP URI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Phone Number / SIP URI */}
                    <div className="space-y-2">
                      <Label>
                        {rule.destination_type === 'sip_uri' ? 'SIP URI' : 'Phone Number'}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder={
                          rule.destination_type === 'sip_uri'
                            ? 'sip:user@domain.com'
                            : '+15551234567'
                        }
                        value={rule.phone_number}
                        onChange={(e) =>
                          handleUpdateRule(index, 'phone_number', e.target.value)
                        }
                      />
                      {rule.destination_type === 'phone_number' && (
                        <p className="text-xs text-muted-foreground">
                          Use E.164 format: + followed by country code and number (e.g., +15551234567)
                        </p>
                      )}
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                      <Label>
                        Condition
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        placeholder="Enter the condition for transferring to this phone number (e.g., 'User requests to speak with a human operator')"
                        value={rule.condition}
                        onChange={(e) =>
                          handleUpdateRule(index, 'condition', e.target.value)
                        }
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Describe in natural language when this transfer should occur.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={handleAddRule}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Rule
              </Button>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Rules
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
