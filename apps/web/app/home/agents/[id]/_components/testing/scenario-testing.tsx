'use client';

import { useState } from 'react';

import { TestTube } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { ScenarioResult, TestScenario } from './types';

const defaultScenarios: TestScenario[] = [
  {
    id: '1',
    name: 'Donation Objection - Budget',
    description: 'Test how agent handles budget concerns',
    userInput: "I'd like to donate, but I'm on a tight budget right now.",
    category: 'objection',
  },
  {
    id: '2',
    name: 'General Question',
    description: 'Test basic information request',
    userInput: 'Can you tell me more about your organization?',
    category: 'question',
  },
  {
    id: '3',
    name: 'Donation Interest',
    description: 'Test positive donation response',
    userInput: "I'm interested in making a donation. How can I help?",
    category: 'donation',
  },
];

interface ScenarioTestingProps {
  agentId: string;
  agentName: string;
}

export function ScenarioTesting({ agentId, agentName }: ScenarioTestingProps) {
  // Scenario testing state
  const [scenarioResults, setScenarioResults] = useState<{
    [scenarioId: string]: ScenarioResult;
  }>({});

  const runScenarioTest = async (scenario: TestScenario) => {
    try {
      const response = await fetch('/api/agent-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_message',
          agent_id: agentId,
          message: scenario.userInput,
          user_id: 'test-user',
          scenario_id: scenario.id,
        }),
      });

      const result = await response.json();

      // Evaluate response quality
      const quality = evaluateResponseQuality(result.data.response, scenario);

      setScenarioResults((prev) => ({
        ...prev,
        [scenario.id]: {
          response: result.data.response,
          quality,
        },
      }));

      toast.success(`Scenario "${scenario.name}" completed`);
    } catch (error) {
      console.error('Scenario test error:', error);
      toast.error('Failed to run scenario test');
    }
  };

  const evaluateResponseQuality = (
    response: string,
    scenario: TestScenario,
  ): 'excellent' | 'good' | 'fair' | 'poor' => {
    const responseLength = response.length;
    const hasKeywords =
      response.toLowerCase().includes('donation') ||
      response.toLowerCase().includes('help') ||
      response.toLowerCase().includes('support');

    if (responseLength > 100 && hasKeywords) return 'excellent';
    if (responseLength > 50 && hasKeywords) return 'good';
    if (responseLength > 20) return 'fair';
    return 'poor';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300';
      case 'poor':
        return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300';
      default:
        return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Scenario List */}
      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
          <CardDescription>
            Pre-defined scenarios to test your agent's responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {defaultScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="hover:bg-muted cursor-pointer rounded-lg border p-4"
              onClick={() => runScenarioTest(scenario)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {scenario.description}
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {scenario.category}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <TestTube className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scenario Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Performance metrics for scenario tests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(scenarioResults).length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <TestTube className="mx-auto mb-2 h-8 w-8" />
              <p>Run a scenario test to see results</p>
            </div>
          ) : (
            Object.entries(scenarioResults).map(([scenarioId, result]) => {
              const scenario = defaultScenarios.find(
                (s) => s.id === scenarioId,
              );
              return (
                <div key={scenarioId} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-medium">{scenario?.name}</h4>
                    <Badge className={getQualityColor(result.quality)}>
                      {result.quality}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        {result.response}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
