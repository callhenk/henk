'use client';

import { useEffect, useRef, useState } from 'react';

import { BookOpen, Edit, Plus, Save, Trash2, X } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function FAQEditor({
  value,
  onChange,
  onSave,
  isSaving,
}: FAQEditorProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ>({
    id: '',
    question: '',
    answer: '',
  });
  const isInitialized = useRef(false);

  // Parse the value string into FAQ objects
  useEffect(() => {
    if (value && !isInitialized.current) {
      try {
        const parsed = JSON.parse(value);
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
      isInitialized.current = true;
    } else if (!value && !isInitialized.current) {
      setFaqs([]);
      isInitialized.current = true;
    }
  }, [value]);

  // Update the parent value when FAQs change (but only after initialization)
  useEffect(() => {
    if (isInitialized.current) {
      const faqString = JSON.stringify(faqs, null, 2);
      onChange(faqString);
    }
  }, [faqs, onChange]);

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: '',
    };
    setFaqs([...faqs, newFAQ]);
    setEditingId(newFAQ.id);
    setEditingFAQ(newFAQ);
  };

  const startEditing = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditingFAQ({ ...faq });
  };

  const saveEditing = () => {
    if (editingFAQ.question.trim() && editingFAQ.answer.trim()) {
      setFaqs(faqs.map((faq) => (faq.id === editingId ? editingFAQ : faq)));
      setEditingId(null);
      setEditingFAQ({ id: '', question: '', answer: '' });
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingFAQ({ id: '', question: '', answer: '' });
  };

  const deleteFAQ = (id: string) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  const handleSave = () => {
    onSave();
  };

  return (
    <div className="space-y-4">
      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              {editingId === faq.id ? (
                // Editing mode
                <div className="space-y-3">
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
                      placeholder="Enter the question..."
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
                      placeholder="Enter the answer..."
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEditing}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-foreground mb-2 font-medium">
                        {faq.question}
                      </h4>
                      <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                        {faq.answer}
                      </p>
                    </div>
                    <div className="ml-4 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(faq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteFAQ(faq.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add FAQ Button */}
      <Button variant="outline" onClick={addFAQ} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add FAQ
      </Button>

      {/* Save Button */}
      {faqs.length > 0 && (
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save FAQs'}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {faqs.length === 0 && (
        <div className="py-8 text-center">
          <div className="text-muted-foreground mb-4">
            <BookOpen className="mx-auto mb-2 h-12 w-12" />
            <p className="text-sm">No FAQs added yet</p>
            <p className="text-muted-foreground text-xs">
              Add common questions and responses to help your agent handle
              objections
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
