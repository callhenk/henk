export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          id: string;
          name: string;
          picture_url: string | null;
          public_data: Json;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          picture_url?: string | null;
          public_data?: Json;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          picture_url?: string | null;
          public_data?: Json;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'accounts_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      agents: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string;
          voice_type: string;
          voice_id: string | null;
          speaking_tone: string;
          voice_settings: Json | null;
          personality: string | null;
          script_template: string | null;
          organization_info: string | null;
          donor_context: string | null;
          starting_message: string | null;
          faqs: Json | null;
          knowledge_base: Json | null;
          workflow_config: Json | null;
          elevenlabs_agent_id: string | null;
          caller_id: string | null;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          business_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: string;
          voice_type?: string;
          voice_id?: string | null;
          speaking_tone?: string;
          voice_settings?: Json | null;
          personality?: string | null;
          script_template?: string | null;
          organization_info?: string | null;
          donor_context?: string | null;
          caller_id?: string | null;
          starting_message?: string | null;
          faqs?: Json | null;
          knowledge_base?: Json | null;
          workflow_config?: Json | null;
          elevenlabs_agent_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          business_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          voice_type?: string;
          voice_id?: string | null;
          speaking_tone?: string;
          voice_settings?: Json | null;
          personality?: string | null;
          script_template?: string | null;
          organization_info?: string | null;
          caller_id?: string | null;
          donor_context?: string | null;
          starting_message?: string | null;
          faqs?: Json | null;
          knowledge_base?: Json | null;
          workflow_config?: Json | null;
          elevenlabs_agent_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          business_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'agents_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'agents_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'agents_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      audio_generations: {
        Row: {
          id: string;
          campaign_id: string | null;
          agent_id: string | null;
          lead_id: string | null;
          text_content: string;
          voice_id: string;
          voice_settings: Json | null;
          status: string;
          audio_url: string | null;
          file_size_bytes: number | null;
          duration_seconds: number | null;
          elevenlabs_request_id: string | null;
          elevenlabs_voice_name: string | null;
          model_id: string;
          generation_time_ms: number | null;
          cost_cents: number | null;
          cache_hit: boolean;
          cache_key: string | null;
          error_code: string | null;
          error_message: string | null;
          retry_count: number;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          campaign_id?: string | null;
          agent_id?: string | null;
          lead_id?: string | null;
          text_content: string;
          voice_id: string;
          voice_settings?: Json | null;
          status?: string;
          audio_url?: string | null;
          file_size_bytes?: number | null;
          duration_seconds?: number | null;
          elevenlabs_request_id?: string | null;
          elevenlabs_voice_name?: string | null;
          model_id?: string;
          generation_time_ms?: number | null;
          cost_cents?: number | null;
          cache_hit?: boolean;
          cache_key?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          retry_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string | null;
          agent_id?: string | null;
          lead_id?: string | null;
          text_content?: string;
          voice_id?: string;
          voice_settings?: Json | null;
          status?: string;
          audio_url?: string | null;
          file_size_bytes?: number | null;
          duration_seconds?: number | null;
          elevenlabs_request_id?: string | null;
          elevenlabs_voice_name?: string | null;
          model_id?: string;
          generation_time_ms?: number | null;
          cost_cents?: number | null;
          cache_hit?: boolean;
          cache_key?: string | null;
          error_code?: string | null;
          error_message?: string | null;
          retry_count?: number;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audio_generations_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audio_generations_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audio_generations_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audio_generations_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string;
          account_id: string;
          industry: string | null;
          website: string | null;
          phone: string | null;
          address: string | null;
          logo_url: string | null;
          settings: Json | null;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: string;
          account_id: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          account_id?: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          address?: string | null;
          logo_url?: string | null;
          settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'businesses_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'businesses_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'businesses_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string;
          agent_id: string | null;
          start_date: string | null;
          end_date: string | null;

          // New: Calling & Voice
          goal_metric: string | null; // 'pledge_rate' | 'average_gift' | 'total_donations'
          disclosure_line: string | null;
          call_window_start: string | null; // time with time zone -> string
          call_window_end: string | null; // time with time zone -> string

          // New: Audience
          audience_list_id: string | null; // uuid
          dedupe_by_phone: boolean; // default false
          exclude_dnc: boolean; // default true
          audience_contact_count: number; // default 0

          // Existing
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
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: string;
          agent_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;

          // New: Calling & Voice
          goal_metric?: string | null;
          disclosure_line?: string | null;
          call_window_start?: string | null;
          call_window_end?: string | null;

          // New: Audience
          audience_list_id?: string | null;
          dedupe_by_phone?: boolean; // if omitted -> false
          exclude_dnc?: boolean; // if omitted -> true
          audience_contact_count?: number; // if omitted -> 0

          // Existing
          max_attempts?: number;
          daily_call_cap?: number;
          script: string;
          retry_logic?: string;
          budget?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          business_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          agent_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;

          // New: Calling & Voice
          goal_metric?: string | null;
          disclosure_line?: string | null;
          call_window_start?: string | null;
          call_window_end?: string | null;

          // New: Audience
          audience_list_id?: string | null;
          dedupe_by_phone?: boolean;
          exclude_dnc?: boolean;
          audience_contact_count?: number;

          // Existing
          max_attempts?: number;
          daily_call_cap?: number;
          script?: string;
          retry_logic?: string;
          budget?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          business_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campaigns_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaigns_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaigns_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaigns_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          // Add an FK for audience_list_id here if/when you create an audience_lists table + constraint.
        ];
      };
      conversations: {
        Row: {
          id: string;
          campaign_id: string;
          agent_id: string;
          lead_id: string;
          status: string;
          duration_seconds: number | null;
          call_sid: string | null;
          recording_url: string | null;
          transcript: string | null;
          sentiment_score: number | null;
          key_points: Json | null;
          outcome: string | null;
          notes: string | null;
          started_at: string | null;
          ended_at: string | null;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          conversation_id: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          agent_id: string;
          lead_id: string;
          status?: string;
          duration_seconds?: number | null;
          call_sid?: string | null;
          recording_url?: string | null;
          transcript?: string | null;
          sentiment_score?: number | null;
          key_points?: Json | null;
          outcome?: string | null;
          notes?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          conversation_id?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          agent_id?: string;
          lead_id?: string;
          status?: string;
          duration_seconds?: number | null;
          call_sid?: string | null;
          recording_url?: string | null;
          transcript?: string | null;
          sentiment_score?: number | null;
          key_points?: Json | null;
          outcome?: string | null;
          notes?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          conversation_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      integrations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          status: string;
          config: Json | null;
          credentials: Json | null;
          last_sync_at: string | null;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          business_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: string;
          status?: string;
          config?: Json | null;
          credentials?: Json | null;
          last_sync_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          business_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          status?: string;
          config?: Json | null;
          credentials?: Json | null;
          last_sync_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          business_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'integrations_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'integrations_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'integrations_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          business_id: string;
          source: string;
          source_id: string | null;
          source_metadata: Json;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          mobile_phone: string | null;
          street: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          company: string | null;
          title: string | null;
          department: string | null;
          lead_source: string | null;
          description: string | null;
          owner_id: string | null;
          do_not_call: boolean;
          do_not_email: boolean;
          email_opt_out: boolean;
          timezone: string | null;
          preferred_language: string | null;
          tags: Json;
          custom_fields: Json;
          last_synced_at: string | null;
          sync_status: string;
          sync_error: string | null;
          campaign_id: string | null;
          status: string;
          last_contact_date: string | null;
          attempts: number;
          pledged_amount: number | null;
          donated_amount: number | null;
          notes: string | null;
          dnc: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          source?: string;
          source_id?: string | null;
          source_metadata?: Json;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          mobile_phone?: string | null;
          street?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          company?: string | null;
          title?: string | null;
          department?: string | null;
          lead_source?: string | null;
          description?: string | null;
          owner_id?: string | null;
          do_not_call?: boolean;
          do_not_email?: boolean;
          email_opt_out?: boolean;
          timezone?: string | null;
          preferred_language?: string | null;
          tags?: Json;
          custom_fields?: Json;
          last_synced_at?: string | null;
          sync_status?: string;
          sync_error?: string | null;
          campaign_id?: string | null;
          status?: string;
          last_contact_date?: string | null;
          attempts?: number;
          pledged_amount?: number | null;
          donated_amount?: number | null;
          notes?: string | null;
          dnc?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          source?: string;
          source_id?: string | null;
          source_metadata?: Json;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          mobile_phone?: string | null;
          street?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          company?: string | null;
          title?: string | null;
          department?: string | null;
          lead_source?: string | null;
          description?: string | null;
          owner_id?: string | null;
          do_not_call?: boolean;
          do_not_email?: boolean;
          email_opt_out?: boolean;
          timezone?: string | null;
          preferred_language?: string | null;
          tags?: Json;
          custom_fields?: Json;
          last_synced_at?: string | null;
          sync_status?: string;
          sync_error?: string | null;
          campaign_id?: string | null;
          status?: string;
          last_contact_date?: string | null;
          attempts?: number;
          pledged_amount?: number | null;
          donated_amount?: number | null;
          notes?: string | null;
          dnc?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'leads_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      team_members: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          role: string;
          status: string;
          permissions: Json | null;
          invited_by: string | null;
          invited_at: string | null;
          accepted_at: string | null;
          last_active_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          user_id: string;
          role?: string;
          status?: string;
          permissions?: Json | null;
          invited_by?: string | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          last_active_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          user_id?: string;
          role?: string;
          status?: string;
          permissions?: Json | null;
          invited_by?: string | null;
          invited_at?: string | null;
          accepted_at?: string | null;
          last_active_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_members_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      workflows: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          agent_id: string;
          status: string;
          version: number;
          is_default: boolean;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          agent_id: string;
          status?: string;
          version?: number;
          is_default?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          agent_id?: string;
          status?: string;
          version?: number;
          is_default?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workflows_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workflows_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workflows_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      workflow_edges: {
        Row: {
          id: string;
          workflow_id: string;
          edge_id: string;
          source_node_id: string;
          target_node_id: string;
          source_handle: string | null;
          target_handle: string | null;
          label: string | null;
          condition: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          edge_id: string;
          source_node_id: string;
          target_node_id: string;
          source_handle?: string | null;
          target_handle?: string | null;
          label?: string | null;
          condition?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          edge_id?: string;
          source_node_id?: string;
          target_node_id?: string;
          source_handle?: string | null;
          target_handle?: string | null;
          label?: string | null;
          condition?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workflow_edges_workflow_id_fkey';
            columns: ['workflow_id'];
            isOneToOne: false;
            referencedRelation: 'workflows';
            referencedColumns: ['id'];
          },
        ];
      };
      workflow_nodes: {
        Row: {
          id: string;
          workflow_id: string;
          node_id: string;
          type: string;
          position_x: number;
          position_y: number;
          data: Json;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          node_id: string;
          type: string;
          position_x: number;
          position_y: number;
          data: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          node_id?: string;
          type?: string;
          position_x?: number;
          position_y?: number;
          data?: Json;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workflow_nodes_workflow_id_fkey';
            columns: ['workflow_id'];
            isOneToOne: false;
            referencedRelation: 'workflows';
            referencedColumns: ['id'];
          },
        ];
      };
      lead_lists: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          color: string;
          list_type: string;
          source: string | null;
          source_id: string | null;
          filter_criteria: Json | null;
          lead_count: number;
          last_updated_at: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          color?: string;
          list_type?: string;
          source?: string | null;
          source_id?: string | null;
          filter_criteria?: Json | null;
          lead_count?: number;
          last_updated_at?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          list_type?: string;
          source?: string | null;
          source_id?: string | null;
          filter_criteria?: Json | null;
          lead_count?: number;
          last_updated_at?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_lists_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
        ];
      };
      lead_list_members: {
        Row: {
          id: string;
          lead_list_id: string;
          lead_id: string;
          added_at: string;
          added_by: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          lead_list_id: string;
          lead_id: string;
          added_at?: string;
          added_by?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          lead_list_id?: string;
          lead_id?: string;
          added_at?: string;
          added_by?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lead_list_members_lead_list_id_fkey';
            columns: ['lead_list_id'];
            isOneToOne: false;
            referencedRelation: 'lead_lists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_list_members_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      business_status: 'active' | 'inactive' | 'suspended';
      team_member_status: 'active' | 'invited' | 'suspended' | 'left';
      team_role: 'owner' | 'admin' | 'member' | 'viewer';
      agent_status: 'active' | 'inactive' | 'draft';
      voice_type: 'ai_generated' | 'human' | 'custom';
      audio_generation_status:
        | 'pending'
        | 'processing'
        | 'completed'
        | 'failed';
      campaign_status: 'draft' | 'active' | 'paused' | 'completed';
      call_status: 'queued' | 'initiated' | 'answered' | 'ended' | 'failed';
      campaign_execution_status:
        | 'pending'
        | 'running'
        | 'paused'
        | 'completed'
        | 'failed';
      queue_status: 'pending' | 'processing' | 'completed' | 'failed';
      conversation_status: 'initiated' | 'active' | 'ended' | 'failed';
      integration_status: 'active' | 'inactive' | 'error';
      lead_status: 'new' | 'contacted' | 'pledged' | 'failed';
      workflow_status: 'draft' | 'active' | 'archived';
      update_type: 'info' | 'warning' | 'error' | 'success';
      event_type:
        | 'call_started'
        | 'call_ended'
        | 'conversation_event'
        | 'system_event';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName]
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions]
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: any;
    }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName]['Insert']
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: any;
      }
      ? Database['public']['Tables'][PublicTableNameOrOptions]['Insert']
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: any;
    }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName]['Update']
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: any;
      }
      ? Database['public']['Tables'][PublicTableNameOrOptions]['Update']
      : never
    : never;
