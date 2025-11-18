'use client';

import { useState } from 'react';

import { X } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import type { Json } from '~/lib/database.types';

interface AgentLanguageProps {
  agent: {
    id: string;
    language: string;
    additional_languages: Json | null;
  };
  onSaveField: (fieldName: string, value: unknown) => void;
}

// Common languages for voice agents
const SUPPORTED_LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'dutch', label: 'Dutch' },
  { value: 'polish', label: 'Polish' },
  { value: 'russian', label: 'Russian' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'hindi', label: 'Hindi' },
] as const;

export function AgentLanguage({ agent, onSaveField }: AgentLanguageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(agent.language);
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>(
    Array.isArray(agent.additional_languages)
      ? (agent.additional_languages as string[])
      : [],
  );
  const [newLanguageInput, setNewLanguageInput] = useState('');

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    onSaveField('language', value);
  };

  const handleAddLanguage = (languageValue: string) => {
    if (
      languageValue &&
      !additionalLanguages.includes(languageValue) &&
      languageValue !== selectedLanguage
    ) {
      const updated = [...additionalLanguages, languageValue];
      setAdditionalLanguages(updated);
      onSaveField('additional_languages', updated);
    }
    setNewLanguageInput('');
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    const updated = additionalLanguages.filter(
      (lang) => lang !== languageToRemove,
    );
    setAdditionalLanguages(updated);
    onSaveField('additional_languages', updated);
  };

  const getLanguageLabel = (value: string) => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.value === value);
    return lang?.label || value.charAt(0).toUpperCase() + value.slice(1);
  };

  // Filter out already selected languages
  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.value !== selectedLanguage &&
      !additionalLanguages.includes(lang.value),
  );

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Agent Language</CardTitle>
        <p className="text-muted-foreground text-sm">
          Choose the default language the agent will communicate in.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Language Selector */}
        <div className="space-y-2">
          <Label htmlFor="agent-language">Agent Language</Label>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger id="agent-language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Additional Languages */}
        <div className="space-y-2">
          <Label>Additional Languages</Label>
          <p className="text-muted-foreground text-xs">
            Specify additional languages which callers can choose from.
          </p>

          {/* Display selected additional languages */}
          {additionalLanguages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {additionalLanguages.map((lang) => (
                <Badge key={lang} variant="secondary" className="gap-1 pr-1">
                  {getLanguageLabel(lang)}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    className="hover:bg-muted ml-1 rounded-sm p-0.5"
                    aria-label={`Remove ${lang}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add additional language */}
          <div className="flex gap-2">
            <Select
              value={newLanguageInput}
              onValueChange={(value) => {
                setNewLanguageInput(value);
                handleAddLanguage(value);
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Add additional languages" />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {additionalLanguages.length === 0 && (
            <p className="text-muted-foreground text-xs italic">
              No additional languages added yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
