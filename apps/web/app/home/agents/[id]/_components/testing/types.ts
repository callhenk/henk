export interface ConversationMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  userInput: string;
  category: 'objection' | 'question' | 'donation' | 'general';
}

export interface ScenarioResult {
  response: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TestMetrics {
  totalTests: number;
  successfulTests: number;
  averageResponseTime: number;
  knowledgeAccuracy: number;
}
