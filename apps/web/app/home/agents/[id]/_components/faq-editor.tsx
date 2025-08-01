'use client';

import React, { useEffect, useState } from 'react';

import { BookOpen, Edit, Plus, Trash2 } from 'lucide-react';

import { useUpdateAgent } from '@kit/supabase/hooks/agents/use-agent-mutations';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQEditorProps {
  value: string;
  agentId: string;
  onSaveSuccess?: () => void;
}

export function FAQEditor({ value, agentId, onSaveSuccess }: FAQEditorProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ>({
    id: '',
    question: '',
    answer: '',
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const updateAgentMutation = useUpdateAgent();

  const saveToDatabase = async (faqsToSave: FAQ[]) => {
    try {
      // Filter out empty FAQs and convert to JSON
      const validFaqs = faqsToSave.filter(
        (faq) => faq.question.trim() && faq.answer.trim(),
      );
      const faqsData = JSON.parse(JSON.stringify(validFaqs));

      // Save to database
      await updateAgentMutation.mutateAsync({
        id: agentId,
        faqs: faqsData,
      });

      onSaveSuccess?.();
    } catch (error) {
      console.error('Failed to save FAQs:', error);
      alert('Failed to save FAQs. Please try again.');
    }
  };

  // Parse the value string into FAQ objects
  useEffect(() => {
    if (value) {
      try {
        console.log('value', value);
        const parsed = JSON.parse(value);
        console.log('parsed', parsed);
        if (Array.isArray(parsed)) {
          setFaqs(parsed);
        } else if (typeof parsed === 'object') {
          // Convert old format to new format
          const converted = Object.entries(parsed).map(([key, value]) => ({
            id: key,
            question: key,
            answer: typeof value === 'string' ? value : JSON.stringify(value),
          }));
          setFaqs(converted);
        } else {
          setFaqs([]);
        }
      } catch {
        // If it's plain text, convert to FAQ format
        if (value.trim()) {
          setFaqs([{ id: '1', question: 'General FAQ', answer: value }]);
        } else {
          setFaqs([]);
        }
      }
    } else {
      setFaqs([]);
    }
  }, [value]);

  const addFAQ = (e?: React.MouseEvent) => {
    // Prevent any potential form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: '',
    };
    setFaqs([...faqs, newFAQ]);
    setEditingId(newFAQ.id);
    setEditingFAQ(newFAQ);
    // Don't save immediately - wait for user to fill in the FAQ and click Save
  };

  const startEditing = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditingFAQ({ ...faq });
  };

  const saveEditing = async () => {
    if (editingFAQ.question.trim() && editingFAQ.answer.trim()) {
      const updatedFaqs = faqs.map((faq) =>
        faq.id === editingId ? editingFAQ : faq,
      );
      setFaqs(updatedFaqs);
      setEditingId(null);
      setEditingFAQ({ id: '', question: '', answer: '' });

      // Save immediately when editing is saved
      await saveToDatabase(updatedFaqs);
    } else {
      // If the FAQ is empty, just cancel editing without saving
      setEditingId(null);
      setEditingFAQ({ id: '', question: '', answer: '' });
      // Remove the empty FAQ from the list
      const updatedFaqs = faqs.filter((faq) => faq.id !== editingId);
      setFaqs(updatedFaqs);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingFAQ({ id: '', question: '', answer: '' });
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const deleteFAQ = async (id: string) => {
    const updatedFaqs = faqs.filter((faq) => faq.id !== id);
    setFaqs(updatedFaqs);
    setDeletingId(null);

    // Save immediately when FAQ is deleted
    await saveToDatabase(updatedFaqs);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-card rounded-lg border p-4">
            {editingId === faq.id ? (
              <div className="space-y-3">
                {!faq.question && !faq.answer && (
                  <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-sm text-blue-800">
                      💡 Fill in both the question and answer to save this FAQ.
                      Empty FAQs will be discarded.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Question
                  </label>
                  <Input
                    value={editingFAQ.question}
                    onChange={(e) =>
                      setEditingFAQ({
                        ...editingFAQ,
                        question: e.target.value,
                      })
                    }
                    placeholder="e.g., What is your organization's mission?"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm font-medium">
                    Answer
                  </label>
                  <Textarea
                    value={editingFAQ.answer}
                    onChange={(e) =>
                      setEditingFAQ({ ...editingFAQ, answer: e.target.value })
                    }
                    placeholder="Provide a clear, empathetic response that addresses the question..."
                    className="min-h-[100px] resize-none"
                  />
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Keep answers clear and empathetic</span>
                    <span>{editingFAQ.answer.length} characters</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveEditing}
                    disabled={
                      !editingFAQ.question.trim() || !editingFAQ.answer.trim()
                    }
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // Display mode
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-foreground font-medium">
                      {faq.question}
                    </h4>
                    <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="ml-4 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(faq)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {deletingId === faq.id ? (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteFAQ(faq.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={cancelDelete}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => confirmDelete(faq.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add FAQ Button */}
      <Button
        type="button"
        variant="outline"
        onClick={(e) => addFAQ(e)}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add FAQ
      </Button>

      {/* Save Button */}

      {/* Empty State */}
      {faqs.length === 0 && (
        <div className="py-8 text-center">
          <div className="text-muted-foreground">
            <BookOpen className="mx-auto mb-2 h-12 w-12" />
            <p className="text-sm">No FAQs added yet</p>
            <p className="text-muted-foreground text-xs">
              Add common questions and responses to help your agent handle
              objections effectively
            </p>
            <div className="bg-muted mt-4 rounded-lg p-4 text-left">
              <p className="mb-2 text-xs font-medium">
                💡 Tips for effective FAQs:
              </p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>
                  • Address common objections like &quot;I can&apos;t afford it
                  right now&quot;
                </li>
                <li>
                  • Include questions about your organization&apos;s impact
                </li>
                <li>• Provide clear, empathetic responses</li>
                <li>• Keep answers concise but informative</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
