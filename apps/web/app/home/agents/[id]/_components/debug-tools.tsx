'use client';

import { useState } from 'react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

interface DebugToolsProps {
  agent: {
    id: string;
    elevenlabs_agent_id?: string | null;
  };
  onCheckAgentDetails: () => Promise<void>;
  onTrainAgent: () => Promise<void>;
  onCheckKnowledgeBase: () => Promise<void>;
  onLinkKnowledgeBase: () => Promise<void>;
  isLoadingAgentDetails: boolean;
  isTrainingAgent: boolean;
  isCheckingKnowledgeBase: boolean;
  isLinkingKnowledgeBase: boolean;
  elevenLabsAgentDetails: Record<string, unknown> | null;
  knowledgeBaseStatus: {
    hasDocuments: boolean;
    documentCount: number;
    documentTypes: string[];
    lastUpdated?: string;
    error?: string;
    hasKnowledgeBaseConfigured?: boolean;
    agentPromptLength?: number;
  } | null;
}

export function DebugTools({
  agent,
  onCheckAgentDetails,
  onTrainAgent,
  onCheckKnowledgeBase,
  onLinkKnowledgeBase,
  isLoadingAgentDetails,
  isTrainingAgent,
  isCheckingKnowledgeBase,
  isLinkingKnowledgeBase,
  elevenLabsAgentDetails,
  knowledgeBaseStatus,
}: DebugToolsProps) {
  const [isDebugToolsMinimized, setIsDebugToolsMinimized] = useState(false);

  // Only show in development/staging
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed right-2 bottom-4 z-50 sm:right-4">
      <div className="rounded-lg border border-gray-200 bg-white shadow-lg sm:p-3">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-gray-700">
              Debug Tools
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDebugToolsMinimized(!isDebugToolsMinimized)}
            className="h-6 w-6 p-0"
          >
            {isDebugToolsMinimized ? (
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            ) : (
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            )}
          </Button>
        </div>
        {!isDebugToolsMinimized && (
          <div className="space-y-2 p-2 pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onCheckAgentDetails}
              disabled={isLoadingAgentDetails || !agent?.elevenlabs_agent_id}
              className="w-full"
            >
              {isLoadingAgentDetails ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                  Loading...
                </>
              ) : (
                'Check Agent Details'
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onTrainAgent}
              disabled={isTrainingAgent || !agent?.elevenlabs_agent_id}
              className="w-full"
            >
              {isTrainingAgent ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                  Training...
                </>
              ) : (
                'Train Agent'
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCheckKnowledgeBase}
              disabled={isCheckingKnowledgeBase || !agent?.elevenlabs_agent_id}
              className="w-full"
            >
              {isCheckingKnowledgeBase ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                  Checking...
                </>
              ) : (
                'Check KB Access'
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLinkKnowledgeBase}
              disabled={isLinkingKnowledgeBase || !agent?.elevenlabs_agent_id}
              className="w-full"
            >
              {isLinkingKnowledgeBase ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
                  Linking...
                </>
              ) : (
                'Link KB to Agent'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* ElevenLabs Agent Details Display */}
      {elevenLabsAgentDetails && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-sm">ElevenLabs Agent Details</span>
              </CardTitle>
              <CardDescription>
                Current configuration from ElevenLabs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4">
                <pre className="overflow-auto text-xs">
                  {JSON.stringify(elevenLabsAgentDetails, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Knowledge Base Status Display */}
      {knowledgeBaseStatus && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-sm">Knowledge Base Status</span>
              </CardTitle>
              <CardDescription>
                Current knowledge base access status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Documents Available:
                  </span>
                  <div className="flex items-center gap-2">
                    {knowledgeBaseStatus.hasDocuments && (
                      <div className="flex h-4 w-4 items-center justify-center rounded border-2 border-green-500 bg-green-500">
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <Badge
                      variant={
                        knowledgeBaseStatus.hasDocuments
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {knowledgeBaseStatus.documentCount} documents
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Agent Configured:</span>
                  <div className="flex items-center gap-2">
                    {knowledgeBaseStatus.hasKnowledgeBaseConfigured && (
                      <div className="flex h-4 w-4 items-center justify-center rounded border-2 border-green-500 bg-green-500">
                        <svg
                          className="h-2.5 w-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                    <Badge
                      variant={
                        knowledgeBaseStatus.hasKnowledgeBaseConfigured
                          ? 'default'
                          : 'destructive'
                      }
                    >
                      {knowledgeBaseStatus.hasKnowledgeBaseConfigured
                        ? 'Yes'
                        : 'No'}
                    </Badge>
                  </div>
                </div>
                {knowledgeBaseStatus.documentTypes.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Document Types:</span>
                    <div className="flex gap-1">
                      {knowledgeBaseStatus.documentTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {knowledgeBaseStatus.hasDocuments &&
                  !knowledgeBaseStatus.hasKnowledgeBaseConfigured && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                      <p className="text-sm text-orange-800">
                        <strong>⚠️ Action Required:</strong> Documents exist but
                        agent is not configured to use them. Click &ldquo;Link
                        KB to Agent&rdquo; in debug tools.
                      </p>
                    </div>
                  )}
                {knowledgeBaseStatus.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {knowledgeBaseStatus.error}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
