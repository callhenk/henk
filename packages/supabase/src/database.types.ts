export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          business_id: string
          caller_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          donor_context: string | null
          elevenlabs_agent_id: string | null
          enabled_tools: Json | null
          faqs: Json | null
          id: string
          knowledge_base: Json | null
          name: string
          organization_info: string | null
          personality: string | null
          script_template: string | null
          speaking_tone: string
          starting_message: string | null
          status: Database["public"]["Enums"]["agent_status"]
          transfer_rules: Json | null
          transfer_to_number_rules: Json | null
          updated_at: string | null
          updated_by: string | null
          voice_id: string | null
          voice_settings: Json | null
          voice_type: Database["public"]["Enums"]["voice_type"]
          workflow_config: Json | null
        }
        Insert: {
          business_id: string
          caller_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          donor_context?: string | null
          elevenlabs_agent_id?: string | null
          enabled_tools?: Json | null
          faqs?: Json | null
          id?: string
          knowledge_base?: Json | null
          name: string
          organization_info?: string | null
          personality?: string | null
          script_template?: string | null
          speaking_tone?: string
          starting_message?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          transfer_rules?: Json | null
          transfer_to_number_rules?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          voice_id?: string | null
          voice_settings?: Json | null
          voice_type?: Database["public"]["Enums"]["voice_type"]
          workflow_config?: Json | null
        }
        Update: {
          business_id?: string
          caller_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          donor_context?: string | null
          elevenlabs_agent_id?: string | null
          enabled_tools?: Json | null
          faqs?: Json | null
          id?: string
          knowledge_base?: Json | null
          name?: string
          organization_info?: string | null
          personality?: string | null
          script_template?: string | null
          speaking_tone?: string
          starting_message?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          transfer_rules?: Json | null
          transfer_to_number_rules?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          voice_id?: string | null
          voice_settings?: Json | null
          voice_type?: Database["public"]["Enums"]["voice_type"]
          workflow_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      agents_knowledge_bases: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          knowledge_base_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          knowledge_base_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          knowledge_base_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_knowledge_bases_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_knowledge_bases_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_generations: {
        Row: {
          agent_id: string | null
          audio_url: string | null
          cache_hit: boolean | null
          cache_key: string | null
          campaign_id: string | null
          cost_cents: number | null
          created_at: string | null
          created_by: string | null
          duration_seconds: number | null
          elevenlabs_request_id: string | null
          elevenlabs_voice_name: string | null
          error_code: string | null
          error_message: string | null
          file_size_bytes: number | null
          generation_time_ms: number | null
          id: string
          lead_id: string | null
          model_id: string | null
          retry_count: number | null
          status: Database["public"]["Enums"]["audio_generation_status"]
          text_content: string
          updated_at: string | null
          voice_id: string
          voice_settings: Json | null
        }
        Insert: {
          agent_id?: string | null
          audio_url?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          campaign_id?: string | null
          cost_cents?: number | null
          created_at?: string | null
          created_by?: string | null
          duration_seconds?: number | null
          elevenlabs_request_id?: string | null
          elevenlabs_voice_name?: string | null
          error_code?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          generation_time_ms?: number | null
          id?: string
          lead_id?: string | null
          model_id?: string | null
          retry_count?: number | null
          status?: Database["public"]["Enums"]["audio_generation_status"]
          text_content: string
          updated_at?: string | null
          voice_id: string
          voice_settings?: Json | null
        }
        Update: {
          agent_id?: string | null
          audio_url?: string | null
          cache_hit?: boolean | null
          cache_key?: string | null
          campaign_id?: string | null
          cost_cents?: number | null
          created_at?: string | null
          created_by?: string | null
          duration_seconds?: number | null
          elevenlabs_request_id?: string | null
          elevenlabs_voice_name?: string | null
          error_code?: string | null
          error_message?: string | null
          file_size_bytes?: number | null
          generation_time_ms?: number | null
          id?: string
          lead_id?: string | null
          model_id?: string | null
          retry_count?: number | null
          status?: Database["public"]["Enums"]["audio_generation_status"]
          text_content?: string
          updated_at?: string | null
          voice_id?: string
          voice_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_generations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audio_generations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          account_id: string
          address: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          status: Database["public"]["Enums"]["business_status"]
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          account_id: string
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          account_id?: string
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      call_attempts: {
        Row: {
          attempt_number: number
          attempted_at: string | null
          audio_generation_id: string | null
          call_log_id: string | null
          campaign_id: string
          created_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          lead_id: string
          next_attempt_at: string | null
          phone_number: string
          result: Database["public"]["Enums"]["call_attempt_result"] | null
          retry_delay_minutes: number | null
          retry_reason: string | null
          scheduled_at: string
          updated_at: string | null
        }
        Insert: {
          attempt_number: number
          attempted_at?: string | null
          audio_generation_id?: string | null
          call_log_id?: string | null
          campaign_id: string
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          lead_id: string
          next_attempt_at?: string | null
          phone_number: string
          result?: Database["public"]["Enums"]["call_attempt_result"] | null
          retry_delay_minutes?: number | null
          retry_reason?: string | null
          scheduled_at: string
          updated_at?: string | null
        }
        Update: {
          attempt_number?: number
          attempted_at?: string | null
          audio_generation_id?: string | null
          call_log_id?: string | null
          campaign_id?: string
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          lead_id?: string
          next_attempt_at?: string | null
          phone_number?: string
          result?: Database["public"]["Enums"]["call_attempt_result"] | null
          retry_delay_minutes?: number | null
          retry_reason?: string | null
          scheduled_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_attempts_audio_generation_id_fkey"
            columns: ["audio_generation_id"]
            isOneToOne: false
            referencedRelation: "audio_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_attempts_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_attempts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          agent_id: string
          answered_at: string | null
          audio_url: string | null
          call_cost: number | null
          call_sid: string | null
          campaign_id: string
          conversation_id: string | null
          created_at: string | null
          created_by: string | null
          direction: string
          donated_amount: number | null
          duration_seconds: number | null
          ended_at: string | null
          error_code: string | null
          error_message: string | null
          from_number: string
          id: string
          initiated_at: string | null
          lead_id: string
          machine_detection_result: string | null
          metadata: Json | null
          outcome: Database["public"]["Enums"]["call_outcome"] | null
          parent_call_sid: string | null
          pledged_amount: number | null
          quality_score: number | null
          queued_at: string | null
          recording_duration_seconds: number | null
          recording_url: string | null
          ring_duration_seconds: number | null
          sentiment_score: number | null
          status: Database["public"]["Enums"]["call_status"]
          to_number: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          answered_at?: string | null
          audio_url?: string | null
          call_cost?: number | null
          call_sid?: string | null
          campaign_id: string
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          direction?: string
          donated_amount?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          error_code?: string | null
          error_message?: string | null
          from_number: string
          id?: string
          initiated_at?: string | null
          lead_id: string
          machine_detection_result?: string | null
          metadata?: Json | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          parent_call_sid?: string | null
          pledged_amount?: number | null
          quality_score?: number | null
          queued_at?: string | null
          recording_duration_seconds?: number | null
          recording_url?: string | null
          ring_duration_seconds?: number | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["call_status"]
          to_number: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          answered_at?: string | null
          audio_url?: string | null
          call_cost?: number | null
          call_sid?: string | null
          campaign_id?: string
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          direction?: string
          donated_amount?: number | null
          duration_seconds?: number | null
          ended_at?: string | null
          error_code?: string | null
          error_message?: string | null
          from_number?: string
          id?: string
          initiated_at?: string | null
          lead_id?: string
          machine_detection_result?: string | null
          metadata?: Json | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          parent_call_sid?: string | null
          pledged_amount?: number | null
          quality_score?: number | null
          queued_at?: string | null
          recording_duration_seconds?: number | null
          recording_url?: string | null
          ring_duration_seconds?: number | null
          sentiment_score?: number | null
          status?: Database["public"]["Enums"]["call_status"]
          to_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_executions: {
        Row: {
          audio_generations_today: number
          average_call_duration_seconds: number | null
          calls_failed: number
          calls_made: number
          calls_successful: number
          calls_this_hour: number
          calls_today: number
          campaign_id: string
          completed_at: string | null
          config_snapshot: Json
          created_at: string | null
          created_by: string | null
          current_throughput_calls_per_hour: number | null
          error_count: number
          estimated_completion_at: string | null
          execution_node: string | null
          id: string
          last_error: string | null
          leads_processed: number
          leads_queued: number
          paused_at: string | null
          process_id: string | null
          resumed_at: string | null
          retry_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_execution_status"]
          success_rate_percentage: number | null
          total_leads: number
          updated_at: string | null
        }
        Insert: {
          audio_generations_today?: number
          average_call_duration_seconds?: number | null
          calls_failed?: number
          calls_made?: number
          calls_successful?: number
          calls_this_hour?: number
          calls_today?: number
          campaign_id: string
          completed_at?: string | null
          config_snapshot?: Json
          created_at?: string | null
          created_by?: string | null
          current_throughput_calls_per_hour?: number | null
          error_count?: number
          estimated_completion_at?: string | null
          execution_node?: string | null
          id?: string
          last_error?: string | null
          leads_processed?: number
          leads_queued?: number
          paused_at?: string | null
          process_id?: string | null
          resumed_at?: string | null
          retry_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_execution_status"]
          success_rate_percentage?: number | null
          total_leads?: number
          updated_at?: string | null
        }
        Update: {
          audio_generations_today?: number
          average_call_duration_seconds?: number | null
          calls_failed?: number
          calls_made?: number
          calls_successful?: number
          calls_this_hour?: number
          calls_today?: number
          campaign_id?: string
          completed_at?: string | null
          config_snapshot?: Json
          created_at?: string | null
          created_by?: string | null
          current_throughput_calls_per_hour?: number | null
          error_count?: number
          estimated_completion_at?: string | null
          execution_node?: string | null
          id?: string
          last_error?: string | null
          leads_processed?: number
          leads_queued?: number
          paused_at?: string | null
          process_id?: string | null
          resumed_at?: string | null
          retry_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_execution_status"]
          success_rate_percentage?: number | null
          total_leads?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_executions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_lead_lists: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          campaign_id: string
          completed_at: string | null
          contacted_leads: number | null
          filter_criteria: Json | null
          id: string
          is_active: boolean | null
          lead_list_id: string
          max_attempts_override: number | null
          priority: number | null
          successful_leads: number | null
          total_leads: number | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          campaign_id: string
          completed_at?: string | null
          contacted_leads?: number | null
          filter_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          lead_list_id: string
          max_attempts_override?: number | null
          priority?: number | null
          successful_leads?: number | null
          total_leads?: number | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          campaign_id?: string
          completed_at?: string | null
          contacted_leads?: number | null
          filter_criteria?: Json | null
          id?: string
          is_active?: boolean | null
          lead_list_id?: string
          max_attempts_override?: number | null
          priority?: number | null
          successful_leads?: number | null
          total_leads?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_lead_lists_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_lead_lists_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_lead_lists_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists_with_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_leads: {
        Row: {
          added_at: string | null
          attempts: number | null
          campaign_id: string
          contacted_at: string | null
          converted_at: string | null
          donated_amount: number | null
          id: string
          last_attempt_at: string | null
          last_call_duration: number | null
          lead_id: string
          lead_list_id: string | null
          next_attempt_at: string | null
          notes: string | null
          outcome: string | null
          pledged_amount: number | null
          status: string | null
          total_talk_time: number | null
        }
        Insert: {
          added_at?: string | null
          attempts?: number | null
          campaign_id: string
          contacted_at?: string | null
          converted_at?: string | null
          donated_amount?: number | null
          id?: string
          last_attempt_at?: string | null
          last_call_duration?: number | null
          lead_id: string
          lead_list_id?: string | null
          next_attempt_at?: string | null
          notes?: string | null
          outcome?: string | null
          pledged_amount?: number | null
          status?: string | null
          total_talk_time?: number | null
        }
        Update: {
          added_at?: string | null
          attempts?: number | null
          campaign_id?: string
          contacted_at?: string | null
          converted_at?: string | null
          donated_amount?: number | null
          id?: string
          last_attempt_at?: string | null
          last_call_duration?: number | null
          lead_id?: string
          lead_list_id?: string | null
          next_attempt_at?: string | null
          notes?: string | null
          outcome?: string | null
          pledged_amount?: number | null
          status?: string | null
          total_talk_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_with_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists_with_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_queue: {
        Row: {
          attempt_number: number
          audio_generation_id: string | null
          calls_made_today: number
          campaign_id: string
          created_at: string | null
          error_count: number
          id: string
          last_call_at: string | null
          last_error: string | null
          lead_id: string
          priority: number
          processing_node: string | null
          processing_started_at: string | null
          requires_audio_generation: boolean
          retry_reason: string | null
          scheduled_for: string
          status: Database["public"]["Enums"]["queue_status"]
          updated_at: string | null
        }
        Insert: {
          attempt_number?: number
          audio_generation_id?: string | null
          calls_made_today?: number
          campaign_id: string
          created_at?: string | null
          error_count?: number
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          lead_id: string
          priority?: number
          processing_node?: string | null
          processing_started_at?: string | null
          requires_audio_generation?: boolean
          retry_reason?: string | null
          scheduled_for: string
          status?: Database["public"]["Enums"]["queue_status"]
          updated_at?: string | null
        }
        Update: {
          attempt_number?: number
          audio_generation_id?: string | null
          calls_made_today?: number
          campaign_id?: string
          created_at?: string | null
          error_count?: number
          id?: string
          last_call_at?: string | null
          last_error?: string | null
          lead_id?: string
          priority?: number
          processing_node?: string | null
          processing_started_at?: string | null
          requires_audio_generation?: boolean
          retry_reason?: string | null
          scheduled_for?: string
          status?: Database["public"]["Enums"]["queue_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_queue_audio_generation_id_fkey"
            columns: ["audio_generation_id"]
            isOneToOne: false
            referencedRelation: "audio_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_queue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          agent_id: string | null
          audience_contact_count: number
          audience_list_id: string | null
          budget: number | null
          business_id: string
          call_window_end: string | null
          call_window_start: string | null
          created_at: string | null
          created_by: string | null
          daily_call_cap: number
          dedupe_by_phone: boolean
          description: string | null
          disclosure_line: string | null
          end_date: string | null
          exclude_dnc: boolean
          goal_metric: string | null
          id: string
          max_attempts: number
          name: string
          retry_logic: string
          script: string
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          agent_id?: string | null
          audience_contact_count?: number
          audience_list_id?: string | null
          budget?: number | null
          business_id: string
          call_window_end?: string | null
          call_window_start?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_call_cap?: number
          dedupe_by_phone?: boolean
          description?: string | null
          disclosure_line?: string | null
          end_date?: string | null
          exclude_dnc?: boolean
          goal_metric?: string | null
          id?: string
          max_attempts?: number
          name: string
          retry_logic?: string
          script: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          agent_id?: string | null
          audience_contact_count?: number
          audience_list_id?: string | null
          budget?: number | null
          business_id?: string
          call_window_end?: string | null
          call_window_start?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_call_cap?: number
          dedupe_by_phone?: boolean
          description?: string | null
          disclosure_line?: string | null
          end_date?: string | null
          exclude_dnc?: boolean
          goal_metric?: string | null
          id?: string
          max_attempts?: number
          name?: string
          retry_logic?: string
          script?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_events: {
        Row: {
          agent_text: string | null
          ai_model_used: string | null
          audio_duration_seconds: number | null
          audio_url: string | null
          call_log_id: string | null
          completed_at: string | null
          confidence_score: number | null
          conversation_id: string
          created_at: string | null
          event_type: Database["public"]["Enums"]["conversation_event_type"]
          id: string
          metadata: Json | null
          processing_time_ms: number | null
          sequence_number: number
          started_at: string | null
          user_response: string | null
        }
        Insert: {
          agent_text?: string | null
          ai_model_used?: string | null
          audio_duration_seconds?: number | null
          audio_url?: string | null
          call_log_id?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          conversation_id: string
          created_at?: string | null
          event_type: Database["public"]["Enums"]["conversation_event_type"]
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          sequence_number: number
          started_at?: string | null
          user_response?: string | null
        }
        Update: {
          agent_text?: string | null
          ai_model_used?: string | null
          audio_duration_seconds?: number | null
          audio_url?: string | null
          call_log_id?: string | null
          completed_at?: string | null
          confidence_score?: number | null
          conversation_id?: string
          created_at?: string | null
          event_type?: Database["public"]["Enums"]["conversation_event_type"]
          id?: string
          metadata?: Json | null
          processing_time_ms?: number | null
          sequence_number?: number
          started_at?: string | null
          user_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_events_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string
          call_sid: string | null
          campaign_id: string
          conversation_id: string | null
          created_at: string | null
          created_by: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          key_points: Json | null
          lead_id: string
          notes: string | null
          outcome: string | null
          recording_url: string | null
          sentiment_score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["conversation_status"]
          transcript: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          agent_id: string
          call_sid?: string | null
          campaign_id: string
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          key_points?: Json | null
          lead_id: string
          notes?: string | null
          outcome?: string | null
          recording_url?: string | null
          sentiment_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          transcript?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          agent_id?: string
          call_sid?: string | null
          campaign_id?: string
          conversation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          key_points?: Json | null
          lead_id?: string
          notes?: string | null
          outcome?: string | null
          recording_url?: string | null
          sentiment_score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          transcript?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          business_id: string
          config: Json | null
          created_at: string | null
          created_by: string | null
          credentials: Json | null
          description: string | null
          id: string
          last_sync_at: string | null
          name: string
          status: Database["public"]["Enums"]["integration_status"]
          type: Database["public"]["Enums"]["integration_type"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          business_id: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials?: Json | null
          description?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          status?: Database["public"]["Enums"]["integration_status"]
          type: Database["public"]["Enums"]["integration_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          business_id?: string
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials?: Json | null
          description?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          status?: Database["public"]["Enums"]["integration_status"]
          type?: Database["public"]["Enums"]["integration_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_bases: {
        Row: {
          business_id: string
          char_count: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          elevenlabs_kb_id: string
          file_count: number | null
          id: string
          metadata: Json | null
          name: string
          status: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          business_id: string
          char_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          elevenlabs_kb_id: string
          file_count?: number | null
          id?: string
          metadata?: Json | null
          name: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          business_id?: string
          char_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          elevenlabs_kb_id?: string
          file_count?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_bases_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_list_members: {
        Row: {
          added_at: string | null
          added_by: string | null
          id: string
          lead_id: string
          lead_list_id: string
          notes: string | null
        }
        Insert: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          lead_id: string
          lead_list_id: string
          notes?: string | null
        }
        Update: {
          added_at?: string | null
          added_by?: string | null
          id?: string
          lead_id?: string
          lead_list_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_list_members_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_list_members_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_with_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_list_members_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_list_members_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists_with_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_lists: {
        Row: {
          business_id: string
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          filter_criteria: Json | null
          id: string
          is_archived: boolean | null
          last_updated_at: string | null
          lead_count: number | null
          list_type: string | null
          metadata: Json | null
          name: string
          source: string | null
          source_id: string | null
          tags: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          business_id: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          is_archived?: boolean | null
          last_updated_at?: string | null
          lead_count?: number | null
          list_type?: string | null
          metadata?: Json | null
          name: string
          source?: string | null
          source_id?: string | null
          tags?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          business_id?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          is_archived?: boolean | null
          last_updated_at?: string | null
          lead_count?: number | null
          list_type?: string | null
          metadata?: Json | null
          name?: string
          source?: string | null
          source_id?: string | null
          tags?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_lists_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_id: string
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          department: string | null
          description: string | null
          dnc: boolean | null
          do_not_call: boolean | null
          do_not_email: boolean | null
          email: string | null
          email_opt_out: boolean | null
          first_name: string | null
          id: string
          last_activity_at: string | null
          last_name: string | null
          last_synced_at: string | null
          lead_score: number | null
          lead_source: string | null
          mobile_phone: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          preferred_language: string | null
          quality_rating: string | null
          source: string
          source_id: string | null
          source_metadata: Json | null
          state: string | null
          status: string | null
          street: string | null
          sync_error: string | null
          sync_status: string | null
          tags: Json | null
          timezone: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          business_id: string
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          department?: string | null
          description?: string | null
          dnc?: boolean | null
          do_not_call?: boolean | null
          do_not_email?: boolean | null
          email?: string | null
          email_opt_out?: boolean | null
          first_name?: string | null
          id?: string
          last_activity_at?: string | null
          last_name?: string | null
          last_synced_at?: string | null
          lead_score?: number | null
          lead_source?: string | null
          mobile_phone?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          quality_rating?: string | null
          source?: string
          source_id?: string | null
          source_metadata?: Json | null
          state?: string | null
          status?: string | null
          street?: string | null
          sync_error?: string | null
          sync_status?: string | null
          tags?: Json | null
          timezone?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          business_id?: string
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          department?: string | null
          description?: string | null
          dnc?: boolean | null
          do_not_call?: boolean | null
          do_not_email?: boolean | null
          email?: string | null
          email_opt_out?: boolean | null
          first_name?: string | null
          id?: string
          last_activity_at?: string | null
          last_name?: string | null
          last_synced_at?: string | null
          lead_score?: number | null
          lead_source?: string | null
          mobile_phone?: string | null
          notes?: string | null
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          quality_rating?: string | null
          source?: string
          source_id?: string | null
          source_metadata?: Json | null
          state?: string | null
          status?: string | null
          street?: string | null
          sync_error?: string | null
          sync_status?: string | null
          tags?: Json | null
          timezone?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          campaign_id: string | null
          id: string
          metric_name: string
          metric_type: string
          node_id: string | null
          recorded_at: string | null
          service_name: string | null
          tags: Json | null
          unit: string | null
          value: number
        }
        Insert: {
          campaign_id?: string | null
          id?: string
          metric_name: string
          metric_type: string
          node_id?: string | null
          recorded_at?: string | null
          service_name?: string | null
          tags?: Json | null
          unit?: string | null
          value: number
        }
        Update: {
          campaign_id?: string | null
          id?: string
          metric_name?: string
          metric_type?: string
          node_id?: string | null
          recorded_at?: string | null
          service_name?: string | null
          tags?: Json | null
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      status_updates: {
        Row: {
          account_id: string
          campaign_id: string | null
          created_at: string | null
          data: Json | null
          email_sent: boolean
          email_sent_at: string | null
          expires_at: string | null
          id: string
          message: string | null
          priority: number
          title: string
          update_type: Database["public"]["Enums"]["status_update_type"]
          websocket_sent: boolean
          websocket_sent_at: string | null
        }
        Insert: {
          account_id: string
          campaign_id?: string | null
          created_at?: string | null
          data?: Json | null
          email_sent?: boolean
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          priority?: number
          title: string
          update_type: Database["public"]["Enums"]["status_update_type"]
          websocket_sent?: boolean
          websocket_sent_at?: string | null
        }
        Update: {
          account_id?: string
          campaign_id?: string | null
          created_at?: string | null
          data?: Json | null
          email_sent?: boolean
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          priority?: number
          title?: string
          update_type?: Database["public"]["Enums"]["status_update_type"]
          websocket_sent?: boolean
          websocket_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_updates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_details: Json | null
          error_message: string | null
          id: string
          integration_id: string
          metadata: Json | null
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string
          sync_status: string
          sync_type: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          integration_id: string
          metadata?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string
          sync_status: string
          sync_type: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          integration_id?: string
          metadata?: Json | null
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string
          sync_status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          business_id: string
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          last_active_at: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["team_role"]
          status: Database["public"]["Enums"]["team_member_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          business_id: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          last_active_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          business_id?: string
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          last_active_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["team_member_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          account_sid: string | null
          call_log_id: string | null
          call_sid: string | null
          campaign_id: string | null
          created_at: string | null
          event_data: Json
          event_type: Database["public"]["Enums"]["webhook_event_type"]
          id: string
          processed: boolean
          processed_at: string | null
          processing_error: string | null
          raw_payload: Json
          received_at: string | null
          signature_valid: boolean | null
          source_ip: string | null
          twilio_signature: string | null
          user_agent: string | null
        }
        Insert: {
          account_sid?: string | null
          call_log_id?: string | null
          call_sid?: string | null
          campaign_id?: string | null
          created_at?: string | null
          event_data?: Json
          event_type: Database["public"]["Enums"]["webhook_event_type"]
          id?: string
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          raw_payload?: Json
          received_at?: string | null
          signature_valid?: boolean | null
          source_ip?: string | null
          twilio_signature?: string | null
          user_agent?: string | null
        }
        Update: {
          account_sid?: string | null
          call_log_id?: string | null
          call_sid?: string | null
          campaign_id?: string | null
          created_at?: string | null
          event_data?: Json
          event_type?: Database["public"]["Enums"]["webhook_event_type"]
          id?: string
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          raw_payload?: Json
          received_at?: string | null
          signature_valid?: boolean | null
          source_ip?: string | null
          twilio_signature?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_edges: {
        Row: {
          condition: Json | null
          created_at: string | null
          edge_id: string
          id: string
          label: string | null
          source_handle: string | null
          source_node_id: string
          target_handle: string | null
          target_node_id: string
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          condition?: Json | null
          created_at?: string | null
          edge_id: string
          id?: string
          label?: string | null
          source_handle?: string | null
          source_node_id: string
          target_handle?: string | null
          target_node_id: string
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          condition?: Json | null
          created_at?: string | null
          edge_id?: string
          id?: string
          label?: string | null
          source_handle?: string | null
          source_node_id?: string
          target_handle?: string | null
          target_node_id?: string
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_edges_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_nodes: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          node_id: string
          position_x: number
          position_y: number
          type: Database["public"]["Enums"]["node_type"]
          updated_at: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          node_id: string
          position_x: number
          position_y: number
          type: Database["public"]["Enums"]["node_type"]
          updated_at?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          node_id?: string
          position_x?: number
          position_y?: number
          type?: Database["public"]["Enums"]["node_type"]
          updated_at?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_nodes_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          agent_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean
          name: string
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "workflows_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      campaign_lead_lists_with_stats: {
        Row: {
          actual_leads_count: number | null
          assigned_at: string | null
          assigned_by: string | null
          campaign_id: string | null
          campaign_name: string | null
          campaign_status: Database["public"]["Enums"]["campaign_status"] | null
          completed_at: string | null
          contacted_count: number | null
          contacted_leads: number | null
          converted_count: number | null
          filter_criteria: Json | null
          id: string | null
          is_active: boolean | null
          lead_list_id: string | null
          list_description: string | null
          list_name: string | null
          max_attempts_override: number | null
          priority: number | null
          successful_leads: number | null
          total_leads: number | null
          total_leads_in_list: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_lead_lists_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_lead_lists_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_lead_lists_lead_list_id_fkey"
            columns: ["lead_list_id"]
            isOneToOne: false
            referencedRelation: "lead_lists_with_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_call_volume: {
        Row: {
          avg_duration: number | null
          busy_calls: number | null
          call_date: string | null
          completed_calls: number | null
          failed_calls: number | null
          no_answer_calls: number | null
          total_calls: number | null
          total_duration: number | null
          voicemail_calls: number | null
        }
        Relationships: []
      }
      lead_lists_with_campaigns: {
        Row: {
          business_id: string | null
          campaigns: Json | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          filter_criteria: Json | null
          id: string | null
          is_archived: boolean | null
          last_updated_at: string | null
          lead_count: number | null
          list_type: string | null
          metadata: Json | null
          name: string | null
          source: string | null
          source_id: string | null
          tags: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_lists_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_with_lists: {
        Row: {
          business_id: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          department: string | null
          description: string | null
          dnc: boolean | null
          do_not_call: boolean | null
          do_not_email: boolean | null
          email: string | null
          email_opt_out: boolean | null
          first_name: string | null
          id: string | null
          last_activity_at: string | null
          last_name: string | null
          last_synced_at: string | null
          lead_score: number | null
          lead_source: string | null
          lists: Json | null
          mobile_phone: string | null
          notes: string | null
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          preferred_language: string | null
          quality_rating: string | null
          source: string | null
          source_id: string | null
          source_metadata: Json | null
          state: string | null
          status: string | null
          street: string | null
          sync_error: string | null
          sync_status: string | null
          tags: Json | null
          timezone: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs_summary: {
        Row: {
          business_id: string | null
          business_name: string | null
          completed_at: string | null
          created_at: string | null
          duration_formatted: string | null
          duration_ms: number | null
          error_message: string | null
          id: string | null
          integration_id: string | null
          integration_name: string | null
          metadata: Json | null
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string | null
          sync_status: string | null
          sync_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_lead_list_to_campaign: {
        Args: {
          p_campaign_id: string
          p_lead_list_id: string
          p_priority?: number
        }
        Returns: string
      }
      can_campaign_make_calls: {
        Args: { p_campaign_id: string }
        Returns: boolean
      }
      create_lead_list_from_csv: {
        Args: { p_business_id: string; p_leads: Json; p_list_name: string }
        Returns: string
      }
      get_latest_sync_status: {
        Args: { p_integration_id: string }
        Returns: {
          records_failed: number
          sync_status: string
          last_sync_at: string
          records_processed: number
          records_created: number
          records_updated: number
        }[]
      }
      get_next_queued_call: {
        Args: Record<PropertyKey, never> | { p_campaign_id: string }
        Returns: {
          phone_number: string
          script: string
          lead_id: string
          agent_id: string
          campaign_id: string
          call_id: string
        }[]
      }
      trigger_campaign_orchestrator: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_campaign_execution_stats: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
    }
    Enums: {
      action_type:
        | "voicemail"
        | "script"
        | "question"
        | "transfer"
        | "hangup"
        | "callback"
        | "donation_request"
        | "follow_up"
      agent_status: "active" | "inactive" | "agent_paused" | "training"
      audio_generation_status:
        | "pending"
        | "generating"
        | "completed"
        | "failed"
        | "cached"
      business_status: "active" | "inactive" | "suspended"
      call_attempt_result:
        | "success"
        | "no_answer"
        | "busy"
        | "failed"
        | "invalid_number"
        | "blocked"
        | "rate_limited"
        | "error"
      call_outcome:
        | "donated"
        | "pledged"
        | "interested"
        | "not_interested"
        | "callback_requested"
        | "voicemail_left"
        | "wrong_number"
        | "do_not_call"
        | "unknown"
      call_status:
        | "queued"
        | "initiated"
        | "ringing"
        | "answered"
        | "in_progress"
        | "completed"
        | "failed"
        | "busy"
        | "no_answer"
        | "voicemail"
        | "cancelled"
      campaign_execution_status:
        | "pending"
        | "initializing"
        | "running"
        | "paused"
        | "pausing"
        | "resuming"
        | "completing"
        | "completed"
        | "cancelled"
        | "failed"
      campaign_status: "draft" | "active" | "paused" | "completed" | "cancelled"
      conversation_event_type:
        | "call_started"
        | "intro_played"
        | "gather_started"
        | "speech_detected"
        | "dtmf_received"
        | "response_processed"
        | "follow_up_question"
        | "objection_handled"
        | "commitment_requested"
        | "call_ended"
        | "transfer_requested"
        | "callback_scheduled"
      conversation_status:
        | "initiated"
        | "in_progress"
        | "completed"
        | "failed"
        | "no_answer"
        | "busy"
        | "voicemail"
      integration_status: "active" | "inactive" | "error" | "pending"
      integration_type:
        | "crm"
        | "payment"
        | "communication"
        | "analytics"
        | "voice"
      lead_status:
        | "new"
        | "contacted"
        | "interested"
        | "pledged"
        | "donated"
        | "not_interested"
        | "unreachable"
        | "failed"
      node_type:
        | "start"
        | "decision"
        | "action"
        | "end"
        | "condition"
        | "loop"
        | "delay"
      queue_status:
        | "pending"
        | "scheduled"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
        | "rate_limited"
      status_update_type:
        | "campaign_started"
        | "campaign_paused"
        | "campaign_resumed"
        | "campaign_completed"
        | "call_initiated"
        | "call_answered"
        | "call_completed"
        | "call_failed"
        | "lead_converted"
        | "error_occurred"
        | "queue_updated"
        | "stats_updated"
      team_member_status: "active" | "invited" | "suspended" | "left"
      team_role: "owner" | "admin" | "member" | "viewer"
      voice_type: "ai_generated" | "custom"
      webhook_event_type:
        | "call_initiated"
        | "call_ringing"
        | "call_answered"
        | "call_completed"
        | "call_failed"
        | "call_busy"
        | "call_no_answer"
        | "gather_speech"
        | "gather_dtmf"
        | "recording_completed"
        | "machine_detection"
      workflow_status: "draft" | "active" | "inactive" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          id: string
          key: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          metadata: Json
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          id: string
          name: string
          metadata: Json
          last_accessed_at: string
          created_at: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          metadata: Json
          last_accessed_at: string
          created_at: string
          updated_at: string
          id: string
          name: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_type: [
        "voicemail",
        "script",
        "question",
        "transfer",
        "hangup",
        "callback",
        "donation_request",
        "follow_up",
      ],
      agent_status: ["active", "inactive", "agent_paused", "training"],
      audio_generation_status: [
        "pending",
        "generating",
        "completed",
        "failed",
        "cached",
      ],
      business_status: ["active", "inactive", "suspended"],
      call_attempt_result: [
        "success",
        "no_answer",
        "busy",
        "failed",
        "invalid_number",
        "blocked",
        "rate_limited",
        "error",
      ],
      call_outcome: [
        "donated",
        "pledged",
        "interested",
        "not_interested",
        "callback_requested",
        "voicemail_left",
        "wrong_number",
        "do_not_call",
        "unknown",
      ],
      call_status: [
        "queued",
        "initiated",
        "ringing",
        "answered",
        "in_progress",
        "completed",
        "failed",
        "busy",
        "no_answer",
        "voicemail",
        "cancelled",
      ],
      campaign_execution_status: [
        "pending",
        "initializing",
        "running",
        "paused",
        "pausing",
        "resuming",
        "completing",
        "completed",
        "cancelled",
        "failed",
      ],
      campaign_status: ["draft", "active", "paused", "completed", "cancelled"],
      conversation_event_type: [
        "call_started",
        "intro_played",
        "gather_started",
        "speech_detected",
        "dtmf_received",
        "response_processed",
        "follow_up_question",
        "objection_handled",
        "commitment_requested",
        "call_ended",
        "transfer_requested",
        "callback_scheduled",
      ],
      conversation_status: [
        "initiated",
        "in_progress",
        "completed",
        "failed",
        "no_answer",
        "busy",
        "voicemail",
      ],
      integration_status: ["active", "inactive", "error", "pending"],
      integration_type: [
        "crm",
        "payment",
        "communication",
        "analytics",
        "voice",
      ],
      lead_status: [
        "new",
        "contacted",
        "interested",
        "pledged",
        "donated",
        "not_interested",
        "unreachable",
        "failed",
      ],
      node_type: [
        "start",
        "decision",
        "action",
        "end",
        "condition",
        "loop",
        "delay",
      ],
      queue_status: [
        "pending",
        "scheduled",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "rate_limited",
      ],
      status_update_type: [
        "campaign_started",
        "campaign_paused",
        "campaign_resumed",
        "campaign_completed",
        "call_initiated",
        "call_answered",
        "call_completed",
        "call_failed",
        "lead_converted",
        "error_occurred",
        "queue_updated",
        "stats_updated",
      ],
      team_member_status: ["active", "invited", "suspended", "left"],
      team_role: ["owner", "admin", "member", "viewer"],
      voice_type: ["ai_generated", "custom"],
      webhook_event_type: [
        "call_initiated",
        "call_ringing",
        "call_answered",
        "call_completed",
        "call_failed",
        "call_busy",
        "call_no_answer",
        "gather_speech",
        "gather_dtmf",
        "recording_completed",
        "machine_detection",
      ],
      workflow_status: ["draft", "active", "inactive", "archived"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const

