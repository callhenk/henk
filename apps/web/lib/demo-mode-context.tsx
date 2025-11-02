'use client';

import React, { createContext, useContext, useState } from 'react';

import type { Json } from '@kit/supabase/database';

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  [key: string]: number | boolean | undefined;
}

export interface MockAgent {
  id: string;
  name: string;
  status: 'active' | 'training' | 'inactive' | 'agent_paused';
  created_at: string;
  updated_at: string;
  elevenlabs_agent_id: string | null;
  description: string | null;
  voice_type: 'custom' | 'ai_generated';
  starting_message: string | null;
  organization_info: string | null;
  donor_context: string | null;
  faqs: string | null;
  script_template: string | null;
  system_prompt: string | null;
  speaking_tone: string;
  voice_settings: VoiceSettings | null;
  caller_id: string | null;
  call_opening: string | null;
  call_closing: string | null;
  objection_handling: string | null;
  donation_tiers: string | null;
  voice_id: string | null;
  personality: string | null;
  knowledge_base: Json | null;
  workflow_config: Json | null;
  created_by: string | null;
  updated_by: string | null;
  business_id: string;
  enabled_tools: Json | null;
  transfer_rules: Json | null;
  transfer_to_number_rules: Json | null;
  language: string;
  additional_languages: Json | null;
  retention_period_days: number | null;
  turn_timeout: number | null;
  eagerness: string | null;
  silence_end_call_timeout: number | null;
  max_conversation_duration: number | null;
}

export interface MockCampaign {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'cancelled' | 'paused' | 'draft';
  agent_id: string | null;
  start_date: string | null;
  end_date: string | null;
  goal_metric: string | null;
  disclosure_line: string | null;
  call_window_start: string | null;
  call_window_end: string | null;
  audience_list_id: string | null;
  dedupe_by_phone: boolean;
  exclude_dnc: boolean;
  audience_contact_count: number;
  max_attempts: number;
  daily_call_cap: number;
  script: string;
  retry_logic: string;
  budget: number | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  business_id: string;
}

export interface MockConversation {
  id: string;
  agent_id: string;
  campaign_id: string;
  lead_id: string;
  status: 'completed' | 'in_progress' | 'failed';
  outcome: 'donated' | 'callback requested' | 'no_answer' | 'not_interested';
  duration_seconds: number;
  donated_amount?: number;
  created_at: string;
  updated_at: string;
  call_sid: string | null;
  recording_url: string | null;
  transcript: string | null;
  sentiment_score: number | null;
  key_points: string | null;
  notes: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  conversation_id: string | null;
}

interface DemoModeContextType {
  isDemoMode: boolean;
  isDemoVisible: boolean;
  toggleDemoMode: () => void;
  toggleDemoVisibility: () => void;
  mockAgents: MockAgent[];
  mockCampaigns: MockCampaign[];
  mockConversations: MockConversation[];
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

function generateMockData() {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mockAgents: MockAgent[] = [
    {
      id: 'agent-1',
      name: 'Sarah Mitchell',
      status: 'active',
      created_at: new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      elevenlabs_agent_id: 'ell_agent_001',
      description:
        'Experienced fundraising specialist with excellent communication skills',
      voice_type: 'ai_generated',
      starting_message:
        "Hello! I'm calling on behalf of our organization to discuss how you can help make a difference.",
      organization_info:
        'We are a nonprofit organization dedicated to improving education and healthcare in underserved communities. Founded in 2015, we have served over 50,000 families across 15 states, providing essential services including scholarships, medical assistance, and community development programs.',
      donor_context:
        'Thank you for your previous support of our educational initiatives. Your contribution made a real difference - last year, your donation helped provide scholarships to 12 students who are now pursuing their dreams in college.',
      faqs: "Q: How will my donation be used? A: 95% goes directly to programs, with only 5% for administrative costs. Q: Is my donation tax-deductible? A: Yes, we are a 501(c)(3) organization. Q: Can I designate my gift? A: Absolutely, you can specify which program you'd like to support.",
      system_prompt:
        "You are Sarah Mitchell, an experienced fundraising specialist representing Hope Foundation. You are warm, professional, and passionate about the organization's mission. Your goal is to engage donors in meaningful conversation about supporting education and healthcare initiatives. Always be respectful of the donor's time and circumstances. If they express interest, guide them through donation options. If they have concerns, address them thoughtfully with facts about the organization's impact.",
      speaking_tone:
        'Professional yet warm, enthusiastic about the mission, empathetic listener',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.8,
        style: 0.4,
        use_speaker_boost: true,
      },
      call_opening:
        "Hi, this is Sarah Mitchell calling from Hope Foundation. I hope you're having a wonderful day! I'm reaching out because you've been such an important supporter of our educational programs, and I wanted to personally share some exciting updates about the impact you've helped create.",
      call_closing:
        "Thank you so much for your time today and for considering a gift to Hope Foundation. Your support truly transforms lives, and we're grateful to have partners like you who believe in our mission. Have a wonderful rest of your day!",
      objection_handling:
        'If they say they already gave: "I completely understand, and we\'re so grateful for your past support! This call is actually about a new emergency initiative." If they\'re not interested: "I totally respect that, and thank you for your honesty. Would you mind if I sent you our impact report so you can see how your previous gifts have been used?" If it\'s not a good time: "Of course! When would be a better time for a brief 5-minute conversation?"',
      donation_tiers:
        '$50 - Provides school supplies for one child for a full semester, $100 - Covers medical checkup and basic care for a family, $250 - Sponsors a week of after-school tutoring for 10 students, $500 - Funds a scholarship application and college prep support, $1000 - Provides comprehensive support for one family for three months',
      voice_id: 'voice_sarah_001',
      script_template: null,
      caller_id: '+15551234567',
      personality: null,
      knowledge_base: null,
      workflow_config: null,
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
      enabled_tools: null,
      transfer_rules: null,
      transfer_to_number_rules: null,
      language: 'english',
      additional_languages: [],
      retention_period_days: 90,
      turn_timeout: 7,
      eagerness: 'normal',
      silence_end_call_timeout: -1,
      max_conversation_duration: 600,
    },
    {
      id: 'agent-2',
      name: 'Michael Rodriguez',
      status: 'active',
      created_at: new Date(
        now.getTime() - 14 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      elevenlabs_agent_id: 'ell_agent_002',
      description:
        'Bilingual outreach specialist focused on community engagement',
      voice_type: 'ai_generated',
      starting_message:
        "Hi there! I hope you're having a great day. I'm reaching out to share an exciting opportunity to support our mission.",
      organization_info:
        'Community Relief Network has been serving disaster-affected communities for over a decade. We specialize in rapid response emergency aid, disaster preparedness education, and long-term community rebuilding. Our bilingual team ensures we can reach and support diverse communities when they need help most.',
      donor_context:
        "Your previous contribution to our Hurricane Recovery Fund helped us provide emergency shelter and food to over 200 families. We're reaching out because a new crisis has emerged that requires immediate action.",
      faqs: 'Q: How quickly does aid reach those in need? A: We typically deploy within 24-48 hours of a disaster. Q: Do you work internationally? A: Currently we focus on North American disasters but partner with global organizations. Q: What types of disasters do you respond to? A: Natural disasters, fires, floods, hurricanes, and community emergencies.',
      system_prompt:
        'You are Michael Rodriguez, a bilingual outreach specialist for Community Relief Network. You are compassionate, urgent but not pushy, and skilled at connecting with people from diverse backgrounds. Your focus is on emergency relief and disaster response. You understand that emergencies are time-sensitive, so you communicate the urgency while being respectful. You can switch between English and Spanish as needed.',
      speaking_tone:
        'Compassionate and urgent, culturally sensitive, clear communicator',
      voice_settings: {
        stability: 0.8,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
      call_opening:
        "Hello, this is Michael Rodriguez from Community Relief Network. I'm calling because we have an urgent situation developing, and your past support has been so valuable in helping families during their darkest moments. Do you have just a few minutes to hear about how we can help together?",
      call_closing:
        "Thank you for your compassion and for considering an emergency gift today. In disasters, every hour counts, and supporters like you make the difference between families having shelter or sleeping in the cold. We'll put any contribution to immediate use. Gracias and God bless.",
      objection_handling:
        'If they gave recently: "I understand completely - your recent gift is still helping families! This is a new emergency that just developed." If they prefer other charities: "That\'s wonderful that you support disaster relief. Would you consider supporting both since this is such an urgent need?" If timing is bad: "I completely understand. Could I send you a quick text with details so you can help when it\'s convenient?"',
      donation_tiers:
        '$25 - Provides emergency food for one family for 3 days, $75 - Supplies emergency shelter materials for one family, $150 - Covers basic emergency supplies for a family of four, $300 - Provides comprehensive emergency aid including food, shelter, and clothing, $500 - Supports rapid response deployment to disaster zones',
      voice_id: 'voice_michael_002',
      script_template: null,
      caller_id: '+15551234568',
      personality: null,
      knowledge_base: null,
      workflow_config: null,
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
      enabled_tools: null,
      transfer_rules: null,
      transfer_to_number_rules: null,
      language: 'english',
      additional_languages: ['spanish'],
      retention_period_days: 90,
      turn_timeout: 5,
      eagerness: 'eager',
      silence_end_call_timeout: -1,
      max_conversation_duration: 600,
    },
    {
      id: 'agent-3',
      name: 'Emma Thompson',
      status: 'training',
      created_at: new Date(
        now.getTime() - 21 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      elevenlabs_agent_id: 'ell_agent_003',
      description:
        'Senior development coordinator with expertise in major gift fundraising',
      voice_type: 'ai_generated',
      starting_message:
        "Good day! I'm calling from our development team to discuss a meaningful way you can make an impact.",
      organization_info:
        'The Capital Foundation focuses on transformative major gifts that create lasting change in communities. We work with philanthropists who want to see significant, measurable impact from their giving. Our major gift program has funded breakthrough research, infrastructure projects, and comprehensive social programs that benefit thousands.',
      donor_context:
        "As one of our valued major gift supporters, your transformative contribution last year funded our new community health center, which has already served over 1,500 patients. We're excited to share a new opportunity that matches your passion for healthcare access.",
      faqs: 'Q: What constitutes a major gift? A: Major gifts typically start at $1,000 and can range into the millions. Q: How do you ensure accountability? A: We provide detailed impact reports and site visits for major donors. Q: Can I be involved in program planning? A: Absolutely! Major donors often serve on advisory committees. Q: Are there naming opportunities? A: Yes, we offer various recognition and naming opportunities.',
      system_prompt:
        "You are Emma Thompson, a senior development coordinator specializing in major gift fundraising for The Capital Foundation. You are sophisticated, strategic, and excellent at building relationships with high-capacity donors. You understand that major gift conversations are about partnership and vision, not just donations. You take time to understand each donor's philanthropic goals and connect them with opportunities that align with their values.",
      speaking_tone:
        'Sophisticated and strategic, relationship-focused, visionary',
      voice_settings: {
        stability: 0.85,
        similarity_boost: 0.8,
        style: 0.3,
        use_speaker_boost: true,
      },
      call_opening:
        "Good afternoon, this is Emma Thompson from The Capital Foundation's Development Team. I'm calling because I have some remarkable news about the impact of your recent major gift, and I'd love to share how it's already changing lives. Do you have a few minutes to hear about the incredible results your partnership has achieved?",
      call_closing:
        'Thank you for your visionary leadership and for considering this partnership opportunity. Transformative change happens when passionate philanthropists like you invest in bold solutions. I look forward to continuing our conversation and exploring how we can work together to create lasting impact.',
      objection_handling:
        'If they need time to think: "Absolutely, decisions of this magnitude deserve careful consideration. I\'d be happy to arrange a site visit so you can see our work firsthand." If they work with other organizations: "That\'s wonderful - strategic philanthropy often involves multiple partnerships. This opportunity might complement your existing giving beautifully." If the amount seems high: "I completely understand. We can explore various giving options including pledges over multiple years or planned giving vehicles."',
      donation_tiers:
        '$1,000 - Leadership Circle member with quarterly impact updates, $5,000 - Program Champion with annual site visit and detailed reporting, $10,000 - Visionary Partner with program advisory role, $25,000 - Transformational Leader with naming recognition, $50,000+ - Legacy Builder with comprehensive partnership benefits',
      voice_id: 'voice_emma_003',
      script_template: null,
      caller_id: '+15551234569',
      personality: null,
      knowledge_base: null,
      workflow_config: null,
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
      enabled_tools: null,
      transfer_rules: null,
      transfer_to_number_rules: null,
      language: 'english',
      additional_languages: [],
      retention_period_days: 90,
      turn_timeout: 10,
      eagerness: 'patient',
      silence_end_call_timeout: 30,
      max_conversation_duration: 900,
    },
    {
      id: 'agent-4',
      name: 'David Chen',
      status: 'active',
      created_at: new Date(
        now.getTime() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      elevenlabs_agent_id: 'ell_agent_004',
      description:
        'Digital outreach specialist with data-driven approach to fundraising',
      voice_type: 'ai_generated',
      starting_message:
        "Hello! Thank you for your past support. I'd like to share how your continued partnership can create lasting change.",
      organization_info:
        'TechForGood Initiative leverages technology and data analytics to maximize the impact of charitable giving. We use AI, machine learning, and advanced analytics to identify the most effective interventions and track real-time impact. Our data-driven approach ensures donors can see exactly how their contributions create measurable change.',
      donor_context:
        'Your previous gift helped fund our predictive analytics platform that has increased program effectiveness by 40%. Based on your giving history and interests in technology-driven solutions, I wanted to share our latest breakthrough that your support made possible.',
      faqs: 'Q: How do you use technology in fundraising? A: We use data analytics to optimize outreach timing, personalize communications, and predict donor interests. Q: Can I see real-time impact data? A: Yes! Donors get access to our impact dashboard with live metrics. Q: Is donor data secure? A: Absolutely - we use bank-level encryption and comply with all privacy regulations. Q: How do you measure success? A: We track both quantitative metrics (funds raised, lives impacted) and qualitative outcomes through surveys and feedback.',
      system_prompt:
        "You are David Chen, a digital outreach specialist for TechForGood Initiative. You are analytical, tech-savvy, and passionate about using data to drive social impact. You excel at explaining complex concepts in simple terms and showing donors concrete evidence of impact. You use data and metrics to build trust and demonstrate transparency. You're comfortable discussing technology but always connect it back to human impact.",
      speaking_tone:
        'Analytical and data-focused, clear communicator, evidence-based',
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.85,
        style: 0.6,
        use_speaker_boost: true,
      },
      call_opening:
        "Hi, this is David Chen from TechForGood Initiative. I'm reaching out because our latest impact data shows some incredible results from your previous contribution, and I wanted to share those numbers with you personally. Plus, I have an exciting update about a new technology breakthrough that your support helped develop.",
      call_closing:
        "Thank you for being such a strategic and data-informed donor. Your support doesn't just fund programs - it helps us innovate and find better ways to create change. I'll send you access to our real-time impact dashboard so you can track the difference you're making every day.",
      objection_handling:
        'If they question effectiveness: "I completely understand - that\'s exactly why we built our transparency platform. Let me share the specific metrics from your last gift." If they prefer traditional charities: "That\'s great! Our technology actually helps traditional nonprofits become more effective too. We could show you the data." If they\'re skeptical about tech: "I hear that concern a lot. The technology is just the tool - what matters is the human impact, and I can show you exactly how many lives we\'ve changed."',
      donation_tiers:
        '$100 - Data Supporter with quarterly impact reports and dashboard access, $250 - Analytics Partner with monthly webinars and direct program updates, $500 - Innovation Advocate with beta access to new tools and platforms, $1,000 - Technology Leader with annual strategy sessions and advisory input, $2,500+ - Digital Visionary with executive briefings and platform development input',
      voice_id: 'voice_david_004',
      script_template: null,
      caller_id: '+15551234570',
      personality: null,
      knowledge_base: null,
      workflow_config: null,
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
      enabled_tools: null,
      transfer_rules: null,
      transfer_to_number_rules: null,
      language: 'english',
      additional_languages: [],
      retention_period_days: 90,
      turn_timeout: 7,
      eagerness: 'normal',
      silence_end_call_timeout: -1,
      max_conversation_duration: 600,
    },
    {
      id: 'agent-5',
      name: 'Lisa Johnson',
      status: 'inactive',
      created_at: new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      elevenlabs_agent_id: 'ell_agent_005',
      description:
        'Volunteer coordinator specializing in community outreach and stewardship',
      voice_type: 'ai_generated',
      starting_message:
        'Hi! I hope this call finds you well. I wanted to personally reach out to talk about our upcoming initiatives.',
      organization_info:
        'Community Volunteers United is a grassroots organization that connects passionate volunteers with meaningful opportunities to serve their neighbors. We focus on building sustainable volunteer programs, organizing community events, and creating lasting relationships between volunteers and the communities they serve. Our strength comes from everyday people doing extraordinary things together.',
      donor_context:
        "You've been such an incredible volunteer and supporter of our community programs. Your hands-on involvement at our food drives and mentoring programs has touched so many lives. I'm calling because we have some exciting volunteer opportunities that match your passion for direct community service.",
      faqs: 'Q: Do I have to volunteer to donate? A: Not at all! We welcome both volunteers and financial supporters. Q: What volunteer opportunities are available? A: We have opportunities ranging from a few hours monthly to ongoing leadership roles. Q: Can I volunteer with my family? A: Absolutely! We love family volunteer opportunities. Q: How do you support volunteers? A: We provide training, ongoing support, and recognition for our volunteer community.',
      system_prompt:
        'You are Lisa Johnson, a volunteer coordinator for Community Volunteers United. You are warm, community-focused, and passionate about grassroots organizing. You understand that people want to make a difference in their own communities and you excel at connecting people with opportunities that match their interests and availability. You value personal connections and relationship-building over high-pressure tactics.',
      speaking_tone:
        'Warm and community-focused, relationship-builder, authentic',
      voice_settings: {
        stability: 0.8,
        similarity_boost: 0.7,
        style: 0.2,
        use_speaker_boost: true,
      },
      call_opening:
        "Hi there! This is Lisa Johnson from Community Volunteers United. I hope you're doing well! I'm calling because I remember how much you enjoyed helping out at our community garden project, and I have some exciting news about new ways you can get involved in making our neighborhood even better.",
      call_closing:
        "Thank you so much for caring about our community and for considering how you can help. Whether you choose to volunteer, donate, or both, know that you're part of a wonderful group of neighbors who are making a real difference right here at home. I hope to see you at our next community event!",
      objection_handling:
        'If they\'re too busy: "I totally understand! We have opportunities that take just an hour a month, or you could support financially instead." If they prefer other organizations: "That\'s wonderful that you\'re already giving back! Our community needs all kinds of support." If they\'re new to volunteering: "No experience needed! We pair new volunteers with experienced mentors, and you can start small to see what you enjoy."',
      donation_tiers:
        '$25 - Community Friend with volunteer appreciation events, $50 - Neighborhood Partner with volunteer toolkit and resources, $100 - Community Champion with leadership training opportunities, $250 - Local Leader with program planning input, $500+ - Community Builder with recognition and advisory role',
      voice_id: 'voice_lisa_005',
      script_template: null,
      caller_id: '+15551234571',
      personality: null,
      knowledge_base: null,
      workflow_config: null,
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
      enabled_tools: null,
      transfer_rules: null,
      transfer_to_number_rules: null,
      language: 'english',
      additional_languages: [],
      retention_period_days: 90,
      turn_timeout: 7,
      eagerness: 'normal',
      silence_end_call_timeout: -1,
      max_conversation_duration: 600,
    },
  ];

  const mockCampaigns: MockCampaign[] = [
    {
      id: 'campaign-1',
      name: 'Annual Giving Campaign 2024',
      description:
        'Our flagship annual campaign focused on sustainable funding for core programs and services.',
      status: 'active',
      agent_id: 'agent-1',
      start_date: new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      end_date: new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      goal_metric: 'total_donations',
      disclosure_line:
        'This call may be recorded for quality assurance purposes.',
      call_window_start: '09:00',
      call_window_end: '17:00',
      audience_list_id: null,
      dedupe_by_phone: false,
      exclude_dnc: true,
      audience_contact_count: 0,
      max_attempts: 3,
      daily_call_cap: 100,
      script:
        'Thank you for your continued support. Would you consider making a gift today?',
      retry_logic: 'retry_3_times',
      budget: 500000,
      created_at: new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
    },
    {
      id: 'campaign-2',
      name: 'Emergency Relief Fund',
      description:
        'Urgent fundraising campaign to support disaster relief efforts and emergency response.',
      status: 'active',
      agent_id: 'agent-2',
      start_date: new Date(
        now.getTime() - 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      end_date: new Date(
        now.getTime() + 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      goal_metric: 'pledge_rate',
      disclosure_line:
        'This call may be recorded for quality assurance purposes.',
      call_window_start: '10:00',
      call_window_end: '18:00',
      audience_list_id: null,
      dedupe_by_phone: false,
      exclude_dnc: true,
      audience_contact_count: 0,
      max_attempts: 3,
      daily_call_cap: 150,
      script:
        'In times of crisis, your emergency gift can save lives. Will you help today?',
      retry_logic: 'retry_3_times',
      budget: 200000,
      created_at: new Date(
        now.getTime() - 15 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
    },
    {
      id: 'campaign-3',
      name: 'Education Support Initiative',
      description:
        'Supporting educational opportunities and scholarships for underserved communities.',
      status: 'draft',
      agent_id: 'agent-3',
      start_date: new Date(
        now.getTime() - 45 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      end_date: new Date(
        now.getTime() + 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      goal_metric: 'average_gift',
      disclosure_line:
        'This call may be recorded for quality assurance purposes.',
      call_window_start: '08:00',
      call_window_end: '16:00',
      audience_list_id: null,
      dedupe_by_phone: false,
      exclude_dnc: true,
      audience_contact_count: 0,
      max_attempts: 2,
      daily_call_cap: 75,
      script:
        'Education transforms lives. Would you consider supporting a student today?',
      retry_logic: 'retry_2_times',
      budget: 150000,
      created_at: new Date(
        now.getTime() - 45 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(
        now.getTime() - 5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
    },
    {
      id: 'campaign-4',
      name: 'Healthcare Access Program',
      description:
        'Expanding access to quality healthcare services in rural and underserved areas.',
      status: 'active',
      agent_id: 'agent-4',
      start_date: new Date(
        now.getTime() - 20 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      end_date: new Date(
        now.getTime() + 40 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      goal_metric: 'total_donations',
      disclosure_line:
        'This call may be recorded for quality assurance purposes.',
      call_window_start: '09:30',
      call_window_end: '17:30',
      audience_list_id: null,
      dedupe_by_phone: false,
      exclude_dnc: true,
      audience_contact_count: 0,
      max_attempts: 3,
      daily_call_cap: 125,
      script:
        'Healthcare is a right, not a privilege. Will you help us expand access?',
      retry_logic: 'retry_3_times',
      budget: 350000,
      created_at: new Date(
        now.getTime() - 20 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      created_by: null,
      updated_by: null,
      business_id: 'demo-business-id',
    },
  ];

  // Generate conversations across multiple days with realistic patterns
  const mockConversations: MockConversation[] = [];

  // Generate conversations for the last 7 days
  for (let day = 0; day < 7; day++) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - day);

    // More calls during business hours
    const callsForDay = day === 0 ? 24 : Math.floor(Math.random() * 15) + 8; // Today has 24 calls

    for (let call = 0; call < callsForDay; call++) {
      // Generate realistic business hours (9 AM - 6 PM)
      const hour = Math.floor(Math.random() * 9) + 9;
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);

      const callTime = new Date(dayDate);
      callTime.setHours(hour, minute, second);

      const outcomes = [
        'donated',
        'callback requested',
        'no_answer',
        'not_interested',
      ] as const;

      // Higher success rate for demo
      const outcome: MockConversation['outcome'] =
        Math.random() < 0.35
          ? 'donated'
          : outcomes[Math.floor(Math.random() * outcomes.length)]!;
      const status: 'completed' | 'in_progress' | 'failed' =
        outcome === 'donated' || outcome === 'callback requested'
          ? 'completed'
          : Math.random() < 0.8
            ? 'completed'
            : 'failed';

      const selectedAgent =
        mockAgents[Math.floor(Math.random() * mockAgents.length)];
      const selectedCampaign =
        mockCampaigns[Math.floor(Math.random() * mockCampaigns.length)];

      if (selectedAgent && selectedCampaign) {
        // Generate realistic donation amounts for successful outcomes
        const donatedAmount =
          outcome === 'donated'
            ? Math.floor(Math.random() * 500) + 50 // $50-$550
            : undefined;

        mockConversations.push({
          id: `conv-${day}-${call}`,
          agent_id: selectedAgent.id,
          campaign_id: selectedCampaign.id,
          lead_id: `lead-${Math.random().toString(36).substr(2, 9)}`,
          status,
          outcome,
          duration_seconds: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
          donated_amount: donatedAmount,
          created_at: callTime.toISOString(),
          updated_at: callTime.toISOString(),
          call_sid: null,
          recording_url: null,
          transcript: null,
          sentiment_score: null,
          key_points: null,
          notes: null,
          started_at: callTime.toISOString(),
          ended_at: callTime.toISOString(),
          created_by: null,
          updated_by: null,
          conversation_id: null,
        });
      }
    }
  }

  // Sort conversations by created_at descending (most recent first)
  mockConversations.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return { mockAgents, mockCampaigns, mockConversations };
}

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    // Check localStorage first for persisted demo mode
    if (typeof window !== 'undefined') {
      return localStorage.getItem('demo-mode-active') === 'true';
    }
    return false;
  });
  const [isDemoVisible, setIsDemoVisible] = useState(() => {
    // Check localStorage for popup visibility
    if (typeof window !== 'undefined') {
      return localStorage.getItem('demo-popup-hidden') !== 'true';
    }
    return true;
  });
  const [mockData] = useState(generateMockData());

  const toggleDemoMode = () => {
    const newDemoMode = !isDemoMode;
    setIsDemoMode(newDemoMode);

    if (typeof window !== 'undefined') {
      if (newDemoMode) {
        localStorage.setItem('demo-mode-active', 'true');
      } else {
        localStorage.removeItem('demo-mode-active');
      }
    }
  };

  const toggleDemoVisibility = () => {
    const newVisibility = !isDemoVisible;
    setIsDemoVisible(newVisibility);

    if (typeof window !== 'undefined') {
      if (newVisibility) {
        localStorage.removeItem('demo-popup-hidden');
      } else {
        localStorage.setItem('demo-popup-hidden', 'true');
      }
    }
  };

  const contextValue: DemoModeContextType = {
    isDemoMode,
    isDemoVisible,
    toggleDemoMode,
    toggleDemoVisibility,
    mockAgents: mockData.mockAgents,
    mockCampaigns: mockData.mockCampaigns,
    mockConversations: mockData.mockConversations,
  };

  return (
    <DemoModeContext.Provider value={contextValue}>
      {children}
    </DemoModeContext.Provider>
  );
}
