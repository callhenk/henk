'use client';

import { useEffect, useState } from 'react';

import { X } from 'lucide-react';
import { toast } from 'sonner';

import { useUpdateLead } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { Badge } from '@kit/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import type { Database } from '~/lib/database.types';

type Lead = Database['public']['Tables']['leads']['Row'];

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
}

export function EditLeadDialog({
  open,
  onOpenChange,
  lead,
}: EditLeadDialogProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const updateLead = useUpdateLead();

  // Initialize tags from lead data
  useEffect(() => {
    if (lead.tags && Array.isArray(lead.tags)) {
      setTags(lead.tags as string[]);
    }
  }, [lead]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await updateLead.mutateAsync({
        id: lead.id,
        first_name: formData.get('first_name') as string,
        last_name: formData.get('last_name') as string,
        email: formData.get('email') as string,
        phone: (formData.get('phone') as string) || null,
        mobile_phone: (formData.get('mobile_phone') as string) || null,
        company: (formData.get('company') as string) || null,
        title: (formData.get('title') as string) || null,
        department: (formData.get('department') as string) || null,
        street: (formData.get('street') as string) || null,
        city: (formData.get('city') as string) || null,
        state: (formData.get('state') as string) || null,
        postal_code: (formData.get('postal_code') as string) || null,
        country: (formData.get('country') as string) || null,
        timezone: (formData.get('timezone') as string) || null,
        do_not_call: formData.get('do_not_call') === 'on',
        do_not_email: formData.get('do_not_email') === 'on',
        lead_score: parseInt(formData.get('lead_score') as string) || 0,
        quality_rating: (formData.get('quality_rating') as string) || null,
        tags: tags,
        notes: (formData.get('notes') as string) || null,
      });

      toast.success('Lead updated successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update lead');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update lead information for {lead.first_name} {lead.last_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="scoring">Scoring & Tags</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    required
                    defaultValue={lead.first_name || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    required
                    defaultValue={lead.last_name || ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={lead.email || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={lead.phone || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile_phone">Mobile Phone</Label>
                  <Input
                    id="mobile_phone"
                    name="mobile_phone"
                    type="tel"
                    defaultValue={lead.mobile_phone || ''}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  name="street"
                  defaultValue={lead.street || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={lead.city || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={lead.state || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    defaultValue={lead.postal_code || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    defaultValue={lead.country || 'United States'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  name="timezone"
                  defaultValue={lead.timezone || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="organization" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  defaultValue={lead.company || ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={lead.title || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    defaultValue={lead.department || ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  className="border-input bg-background min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
                  defaultValue={lead.notes || ''}
                  placeholder="Add any additional notes about this lead..."
                />
              </div>
            </TabsContent>

            <TabsContent value="scoring" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead_score">Lead Score (0-100)</Label>
                  <Input
                    id="lead_score"
                    name="lead_score"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={lead.lead_score || 0}
                  />
                  <p className="text-muted-foreground text-xs">
                    Higher scores indicate higher quality leads
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quality_rating">Quality Rating</Label>
                  <Select
                    name="quality_rating"
                    defaultValue={lead.quality_rating || 'unrated'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hot">🔥 Hot</SelectItem>
                      <SelectItem value="warm">🌡️ Warm</SelectItem>
                      <SelectItem value="cold">❄️ Cold</SelectItem>
                      <SelectItem value="unrated">Unrated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Communication Preferences</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="do_not_call"
                      defaultChecked={lead.do_not_call || false}
                    />
                    <span className="text-sm">Do Not Call</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="do_not_email"
                      defaultChecked={lead.do_not_email || false}
                    />
                    <span className="text-sm">Do Not Email</span>
                  </label>
                </div>
              </div>

              {/* Display metadata */}
              <div className="bg-muted/50 rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-medium">Lead Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Source:</span>{' '}
                    <Badge variant="outline">{lead.source}</Badge>
                  </div>
                  {lead.source_id && (
                    <div>
                      <span className="text-muted-foreground">Source ID:</span>{' '}
                      <span className="font-mono text-xs">
                        {lead.source_id}
                      </span>
                    </div>
                  )}
                  {lead.created_at && (
                    <div>
                      <span className="text-muted-foreground">Created:</span>{' '}
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  )}
                  {lead.last_activity_at && (
                    <div>
                      <span className="text-muted-foreground">
                        Last Activity:
                      </span>{' '}
                      {new Date(lead.last_activity_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateLead.isPending}>
              {updateLead.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
