import type { Edge, Node } from 'reactflow';

// Workflow template interface
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  category: 'fundraising' | 'support' | 'survey' | 'custom';
}

// Workflow templates
export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'fundraising-basic',
    name: 'Basic Fundraising',
    description: 'Standard fundraising workflow with donation processing',
    category: 'fundraising',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Start Call' },
      },
      {
        id: '2',
        type: 'decision',
        position: { x: 250, y: 120 },
        data: {
          label: 'Donor Picks Up?',
          options: ['Yes', 'No'],
          description: 'Check if donor answers the call',
        },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 100, y: 240 },
        data: {
          label: 'Leave Voicemail',
          description: 'Leave a brief voicemail with callback number',
          action: 'voicemail',
        },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 400, y: 240 },
        data: {
          label: 'Begin Conversation',
          description: 'Start the fundraising conversation',
          action: 'conversation',
        },
      },
      {
        id: '5',
        type: 'decision',
        position: { x: 400, y: 360 },
        data: {
          label: 'Donor Interested?',
          options: ['Yes', 'No'],
          description: 'Assess donor interest level',
        },
      },
      {
        id: '6',
        type: 'action',
        position: { x: 600, y: 480 },
        data: {
          label: 'Process Donation',
          description: 'Confirm donation and process payment',
          action: 'donation',
        },
      },
      {
        id: '7',
        type: 'action',
        position: { x: 200, y: 480 },
        data: {
          label: 'Thank & End Call',
          description: 'Thank donor and end call gracefully',
          action: 'end_call',
        },
      },
      {
        id: '8',
        type: 'end',
        position: { x: 400, y: 600 },
        data: { label: 'End Workflow' },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: 'No',
        type: 'smoothstep',
        style: { stroke: '#ef4444', strokeWidth: 2 },
      },
      {
        id: 'e2-4',
        source: '2',
        target: '4',
        label: 'Yes',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e4-5',
        source: '4',
        target: '5',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e5-6',
        source: '5',
        target: '6',
        label: 'Yes',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e5-7',
        source: '5',
        target: '7',
        label: 'No',
        type: 'smoothstep',
        style: { stroke: '#ef4444', strokeWidth: 2 },
      },
      {
        id: 'e6-8',
        source: '6',
        target: '8',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e7-8',
        source: '7',
        target: '8',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'support-basic',
    name: 'Customer Support',
    description: 'Basic customer support workflow with issue resolution',
    category: 'support',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Start Support Call' },
      },
      {
        id: '2',
        type: 'decision',
        position: { x: 250, y: 120 },
        data: {
          label: 'Customer Available?',
          options: ['Yes', 'No'],
          description: 'Check if customer answers',
        },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 100, y: 240 },
        data: {
          label: 'Leave Message',
          description: 'Leave support callback message',
          action: 'voicemail',
        },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 400, y: 240 },
        data: {
          label: 'Greet Customer',
          description: 'Welcome and identify customer',
          action: 'conversation',
        },
      },
      {
        id: '5',
        type: 'decision',
        position: { x: 400, y: 360 },
        data: {
          label: 'Issue Resolved?',
          options: ['Yes', 'No'],
          description: 'Check if issue is resolved',
        },
      },
      {
        id: '6',
        type: 'action',
        position: { x: 600, y: 480 },
        data: {
          label: 'Escalate Issue',
          description: 'Transfer to senior support',
          action: 'conversation',
        },
      },
      {
        id: '7',
        type: 'action',
        position: { x: 200, y: 480 },
        data: {
          label: 'Confirm Resolution',
          description: 'Confirm issue resolution and end call',
          action: 'end_call',
        },
      },
      {
        id: '8',
        type: 'end',
        position: { x: 400, y: 600 },
        data: { label: 'End Support Call' },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: 'No',
        type: 'smoothstep',
        style: { stroke: '#ef4444', strokeWidth: 2 },
      },
      {
        id: 'e2-4',
        source: '2',
        target: '4',
        label: 'Yes',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e4-5',
        source: '4',
        target: '5',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e5-6',
        source: '5',
        target: '6',
        label: 'No',
        type: 'smoothstep',
        style: { stroke: '#ef4444', strokeWidth: 2 },
      },
      {
        id: 'e5-7',
        source: '5',
        target: '7',
        label: 'Yes',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e6-8',
        source: '6',
        target: '8',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e7-8',
        source: '7',
        target: '8',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
    ],
  },
  {
    id: 'survey-basic',
    name: 'Survey Collection',
    description: 'Simple survey workflow for data collection',
    category: 'survey',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 250, y: 0 },
        data: { label: 'Start Survey' },
      },
      {
        id: '2',
        type: 'decision',
        position: { x: 250, y: 120 },
        data: {
          label: 'Person Available?',
          options: ['Yes', 'No'],
          description: 'Check if person answers',
        },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 100, y: 240 },
        data: {
          label: 'End Call',
          description: 'End call if no one available',
          action: 'end_call',
        },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 400, y: 240 },
        data: {
          label: 'Conduct Survey',
          description: 'Ask survey questions',
          action: 'conversation',
        },
      },
      {
        id: '5',
        type: 'decision',
        position: { x: 400, y: 360 },
        data: {
          label: 'Survey Complete?',
          options: ['Yes', 'No'],
          description: 'Check if survey is finished',
        },
      },
      {
        id: '6',
        type: 'action',
        position: { x: 600, y: 480 },
        data: {
          label: 'Thank & End',
          description: 'Thank participant and end call',
          action: 'end_call',
        },
      },
      {
        id: '7',
        type: 'action',
        position: { x: 200, y: 480 },
        data: {
          label: 'Continue Survey',
          description: 'Continue with remaining questions',
          action: 'conversation',
        },
      },
      {
        id: '8',
        type: 'end',
        position: { x: 400, y: 600 },
        data: { label: 'End Survey' },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        label: 'No',
        type: 'smoothstep',
        style: { stroke: '#ef4444', strokeWidth: 2 },
      },
      {
        id: 'e2-4',
        source: '2',
        target: '4',
        label: 'Yes',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e4-5',
        source: '4',
        target: '5',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e5-6',
        source: '5',
        target: '6',
        label: 'Yes',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      {
        id: 'e5-7',
        source: '5',
        target: '7',
        label: 'No',
        type: 'smoothstep',
        style: { stroke: '#ef4444', strokeWidth: 2 },
      },
      {
        id: 'e6-8',
        source: '6',
        target: '8',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      {
        id: 'e7-8',
        source: '7',
        target: '8',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
    ],
  },
];
