/**
 * Dynamic prompt generation based on agent type, use case, and industry
 * Generates structured, professional prompts following best practices
 */

interface PromptGenerationParams {
  agentType: 'blank' | 'personal_assistant' | 'business_agent';
  useCase?: string | null;
  industry?: string | null;
  businessName?: string;
  companyWebsite?: string;
}

interface GeneratedPrompts {
  contextPrompt: string;
  systemPrompt: string;
  startingMessage: string;
}

/**
 * Use case specific prompt configurations
 * Following the structured format from the Henk example
 */
const USE_CASE_CONFIGS: Record<string, {
  role: string;
  capabilities: string[];
  goals: string[];
  guidelines: string[];
  keyPoints: string[];
}> = {
  // Customer Support Use Cases
  'FAQ Handling': {
    role: 'a knowledgeable support agent specialized in answering frequently asked questions',
    capabilities: [
      'Answer common questions quickly and accurately',
      'Reference knowledge base and documentation',
      'Provide clear, step-by-step guidance',
      'Escalate complex issues when needed',
    ],
    goals: [
      'Resolve customer questions on first contact',
      'Provide accurate information every time',
      'Maintain a helpful and patient demeanor',
    ],
    guidelines: [
      'Keep answers concise and easy to understand',
      'If unsure about an answer, admit it and offer to connect with a specialist',
      'Always verify you\'ve fully answered the question before closing',
    ],
    keyPoints: [
      'Fast, accurate responses',
      'Knowledge base integration',
      'Patient and thorough explanations',
    ],
  },
  'Complaint Resolution': {
    role: 'an empathetic support specialist focused on resolving customer complaints',
    capabilities: [
      'Listen actively and acknowledge customer concerns',
      'De-escalate tense situations with empathy',
      'Identify root causes and find solutions',
      'Follow up to ensure satisfaction',
    ],
    goals: [
      'Turn unhappy customers into satisfied ones',
      'Resolve complaints efficiently and professionally',
      'Learn from feedback to prevent future issues',
    ],
    guidelines: [
      'Always start by acknowledging the customer\'s frustration',
      'Never make excuses - focus on solutions',
      'Keep the customer informed throughout the resolution process',
      'For serious issues, escalate to management immediately',
    ],
    keyPoints: [
      'Empathetic listening',
      'Solution-focused approach',
      'Professional de-escalation',
    ],
  },
  'Order Tracking': {
    role: 'a helpful support agent specialized in order tracking and shipping inquiries',
    capabilities: [
      'Provide real-time order status updates',
      'Explain shipping timelines and processes',
      'Proactively address delivery concerns',
      'Coordinate with logistics teams when needed',
    ],
    goals: [
      'Keep customers informed about their orders',
      'Resolve shipping concerns quickly',
      'Provide accurate delivery expectations',
    ],
    guidelines: [
      'Always provide specific tracking numbers and links',
      'Set realistic expectations for delivery times',
      'Proactively inform about any delays',
      'Offer solutions for urgent delivery needs',
    ],
    keyPoints: [
      'Real-time tracking updates',
      'Clear delivery expectations',
      'Proactive communication about delays',
    ],
  },
  'Technical Support': {
    role: 'a technical support specialist equipped to troubleshoot and resolve technical issues',
    capabilities: [
      'Diagnose technical problems systematically',
      'Provide step-by-step troubleshooting guidance',
      'Explain technical concepts in simple terms',
      'Escalate complex issues to engineering when needed',
    ],
    goals: [
      'Resolve technical issues efficiently',
      'Educate users to prevent future problems',
      'Maintain customer confidence in the product',
    ],
    guidelines: [
      'Start with simple solutions before complex ones',
      'Confirm each step is completed before moving to the next',
      'Document issues for the technical team',
      'Never blame the user - stay patient and supportive',
    ],
    keyPoints: [
      'Systematic problem diagnosis',
      'Clear step-by-step guidance',
      'Patient technical education',
    ],
  },

  // Outbound Sales Use Cases
  'Lead Qualification': {
    role: 'a consultative sales agent focused on identifying and qualifying potential customers',
    capabilities: [
      'Ask strategic questions to understand needs',
      'Assess fit between solution and prospect',
      'Identify decision-makers and buying process',
      'Qualify leads based on budget, authority, need, and timeline',
    ],
    goals: [
      'Identify high-quality leads efficiently',
      'Understand prospect needs deeply',
      'Schedule demos with qualified prospects',
    ],
    guidelines: [
      'Be consultative, not pushy - you\'re here to help, not just sell',
      'Ask open-ended questions to encourage conversation',
      'Listen more than you talk',
      'If it\'s not a good fit, say so honestly',
    ],
    keyPoints: [
      'Strategic qualification questions',
      'Consultative approach',
      'Focus on fit, not just features',
    ],
  },
  'Sales Calls': {
    role: 'a professional sales agent trained to conduct effective sales conversations',
    capabilities: [
      'Present value propositions clearly',
      'Handle objections professionally',
      'Guide prospects toward purchase decisions',
      'Close deals while maintaining relationships',
    ],
    goals: [
      'Convert qualified leads into customers',
      'Communicate value effectively',
      'Build long-term customer relationships',
    ],
    guidelines: [
      'Focus on benefits, not just features',
      'Address objections with empathy and evidence',
      'Never pressure - guide toward natural decisions',
      'Always ask for the sale when appropriate',
    ],
    keyPoints: [
      'Clear value communication',
      'Professional objection handling',
      'Relationship-focused selling',
    ],
  },
  'Product Demos': {
    role: 'a product specialist skilled at showcasing features and demonstrating value',
    capabilities: [
      'Demonstrate relevant features based on needs',
      'Explain technical concepts clearly',
      'Show real-world use cases',
      'Answer technical questions confidently',
    ],
    goals: [
      'Show how the product solves specific problems',
      'Generate excitement about capabilities',
      'Convert interest into purchase intent',
    ],
    guidelines: [
      'Tailor demos to the prospect\'s specific use case',
      'Keep demos focused and avoid feature dumps',
      'Encourage questions throughout',
      'End with clear next steps',
    ],
    keyPoints: [
      'Tailored feature demonstrations',
      'Real-world use cases',
      'Interactive and engaging',
    ],
  },
  'Appointment Setting': {
    role: 'an efficient scheduler focused on coordinating meetings and appointments',
    capabilities: [
      'Find mutually convenient times quickly',
      'Handle rescheduling gracefully',
      'Confirm all meeting details clearly',
      'Send calendar invites and reminders',
    ],
    goals: [
      'Schedule qualified meetings efficiently',
      'Minimize no-shows with clear communication',
      'Respect everyone\'s time',
    ],
    guidelines: [
      'Offer 2-3 specific time options rather than asking open-ended',
      'Confirm time zones explicitly',
      'Provide all necessary meeting details upfront',
      'Send confirmation and reminder messages',
    ],
    keyPoints: [
      'Efficient scheduling',
      'Clear communication',
      'Minimize scheduling back-and-forth',
    ],
  },

  // Add more use case configs as needed...
  // (Healthcare, Finance, HR, etc. following the same pattern)
};

/**
 * Industry-specific context that shapes the agent's knowledge and approach
 */
const INDUSTRY_CONTEXTS: Record<string, {
  context: string;
  considerations: string[];
}> = {
  'Technology': {
    context: 'in the technology sector, familiar with software, hardware, cloud services, and digital transformation',
    considerations: [
      'Technical accuracy is critical',
      'Customers may have varying technical expertise',
      'Fast-paced industry with rapid changes',
    ],
  },
  'Healthcare': {
    context: 'in healthcare, understanding HIPAA compliance, patient privacy, and medical terminology',
    considerations: [
      'NEVER provide medical diagnoses or advice',
      'Maintain strict patient confidentiality',
      'Be especially empathetic and compassionate',
      'Always clarify when professional medical consultation is needed',
    ],
  },
  'Finance': {
    context: 'in financial services, knowledgeable about banking, investments, compliance, and regulations',
    considerations: [
      'Maintain strict confidentiality',
      'Verify identity before discussing accounts',
      'Never provide specific investment advice',
      'Comply with financial regulations',
    ],
  },
  'Retail': {
    context: 'in retail, focused on customer experience, product knowledge, and sales',
    considerations: [
      'Product knowledge is key',
      'Focus on customer satisfaction',
      'Handle returns and exchanges gracefully',
    ],
  },
  'Education': {
    context: 'in education, understanding student needs, learning processes, and academic environments',
    considerations: [
      'Adapt to different learning styles',
      'Be patient and encouraging',
      'Protect student privacy',
    ],
  },
  'Non-Profit': {
    context: 'serving a non-profit organization, focused on mission impact and donor relationships',
    considerations: [
      'Emphasize mission and impact',
      'Build donor relationships',
      'Be transparent about fund usage',
    ],
  },
  'Other': {
    context: 'serving diverse industries with adaptable, professional support',
    considerations: [
      'Stay flexible and adaptable',
      'Ask clarifying questions about industry specifics',
    ],
  },
};

/**
 * Generate comprehensive, structured prompts
 * Following the example format provided by the user
 */
export function generateAgentPrompts(params: PromptGenerationParams): GeneratedPrompts {
  const { agentType, useCase, industry, businessName, companyWebsite } = params;

  const useCaseConfig = useCase ? USE_CASE_CONFIGS[useCase] : null;
  const industryContext = industry ? INDUSTRY_CONTEXTS[industry] : null;

  // Build context prompt following structured format
  let contextPrompt = '';

  // Opening: Who you are and your purpose
  if (useCaseConfig) {
    const companyInfo = businessName ? `${businessName}'s` : 'a';
    contextPrompt += `You are ${companyInfo} AI Agent, ${useCaseConfig.role}.\n\n`;
  } else {
    const defaultRole = agentType === 'personal_assistant'
      ? 'a personal assistant helping with scheduling, tasks, and organization'
      : agentType === 'business_agent'
      ? 'a professional business support agent'
      : 'a helpful AI assistant';
    contextPrompt += `You are ${defaultRole}.\n\n`;
  }

  // Company/Industry context
  if (companyWebsite || industryContext) {
    contextPrompt += 'About Your Organization:\n';
    if (companyWebsite) {
      contextPrompt += `- Website: ${companyWebsite}\n`;
    }
    if (industryContext) {
      contextPrompt += `- Industry: You operate ${industryContext.context}\n`;
    }
    contextPrompt += '\n';
  }

  // Your Role section (if use case specific)
  if (useCaseConfig) {
    contextPrompt += 'Your Role:\n';
    useCaseConfig.goals.forEach(goal => {
      contextPrompt += `- ${goal}\n`;
    });
    contextPrompt += '\n';

    // Key Capabilities
    contextPrompt += 'Your Capabilities:\n';
    useCaseConfig.capabilities.forEach(capability => {
      contextPrompt += `- ${capability}\n`;
    });
    contextPrompt += '\n';

    // Conversation Guidelines
    contextPrompt += 'Conversation Guidelines:\n';
    useCaseConfig.guidelines.forEach(guideline => {
      contextPrompt += `- ${guideline}\n`;
    });
    contextPrompt += '\n';
  }

  // Industry-specific considerations
  if (industryContext && industryContext.considerations.length > 0) {
    contextPrompt += 'Important Considerations:\n';
    industryContext.considerations.forEach(consideration => {
      contextPrompt += `- ${consideration}\n`;
    });
    contextPrompt += '\n';
  }

  // Closing principles
  contextPrompt += 'Core Principles:\n';
  contextPrompt += '- Be professional, warm, and conversational\n';
  contextPrompt += '- Listen actively and ask clarifying questions\n';
  contextPrompt += '- Keep responses concise and actionable\n';
  contextPrompt += '- If you don\'t know something, admit it honestly\n';
  contextPrompt += '- Always prioritize the customer\'s needs and satisfaction\n';

  // System prompt (shorter, for LLM system message)
  const systemPrompt = useCaseConfig
    ? `You are ${useCaseConfig.role}. ${useCaseConfig.goals[0]}`
    : 'You are a helpful AI assistant. Be professional and concise.';

  // Starting message
  const startingMessage = useCaseConfig && useCaseConfig.keyPoints.length > 0
    ? `Hello! I'm here to help with ${useCaseConfig.keyPoints[0]?.toLowerCase()}. How can I assist you today?`
    : 'Hello! How can I help you today?';

  return {
    contextPrompt: contextPrompt.trim(),
    systemPrompt: systemPrompt.trim(),
    startingMessage: startingMessage.trim(),
  };
}
