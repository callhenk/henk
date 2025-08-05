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
          id: string;
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
          business_id: string;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          donor_context: string | null;
          faqs: Json | null;
          id: string;
          knowledge_base: Json | null;
          name: string;
          organization_info: string | null;
          personality: string | null;
          script_template: string | null;
          speaking_tone: string | null;
          status: string;
          updated_at: string | null;
          updated_by: string | null;
          voice_id: string | null;
          voice_settings: Json | null;
          voice_type: string | null;
          workflow_config: Json | null;
        };
        Insert: {
          business_id: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          donor_context?: string | null;
          faqs?: Json | null;
          id?: string;
          knowledge_base?: Json | null;
          name: string;
          organization_info?: string | null;
          personality?: string | null;
          script_template?: string | null;
          speaking_tone?: string | null;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          voice_id?: string | null;
          voice_settings?: Json | null;
          voice_type?: string | null;
          workflow_config?: Json | null;
        };
        Update: {
          business_id?: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          donor_context?: string | null;
          faqs?: Json | null;
          id?: string;
          knowledge_base?: Json | null;
          name?: string;
          organization_info?: string | null;
          personality?: string | null;
          script_template?: string | null;
          speaking_tone?: string | null;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          voice_id?: string | null;
          voice_settings?: Json | null;
          voice_type?: string | null;
          workflow_config?: Json | null;
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
      businesses: {
        Row: {
          account_id: string;
          address: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          industry: string | null;
          logo_url: string | null;
          name: string;
          phone: string | null;
          settings: Json | null;
          status: string;
          updated_at: string | null;
          updated_by: string | null;
          website: string | null;
        };
        Insert: {
          account_id: string;
          address?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          industry?: string | null;
          logo_url?: string | null;
          name: string;
          phone?: string | null;
          settings?: Json | null;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          website?: string | null;
        };
        Update: {
          account_id?: string;
          address?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          industry?: string | null;
          logo_url?: string | null;
          name?: string;
          phone?: string | null;
          settings?: Json | null;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          website?: string | null;
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
          agent_id: string | null;
          business_id: string;
          budget: number | null;
          calling_hours: string | null;
          created_at: string | null;
          created_by: string | null;
          daily_call_cap: number | null;
          description: string | null;
          end_date: string | null;
          id: string;
          max_attempts: number | null;
          name: string;
          retry_logic: string | null;
          script: string | null;
          start_date: string | null;
          status: string;
          target_amount: number | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          agent_id?: string | null;
          business_id: string;
          budget?: number | null;
          calling_hours?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          daily_call_cap?: number | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          max_attempts?: number | null;
          name: string;
          retry_logic?: string | null;
          script?: string | null;
          start_date?: string | null;
          status?: string;
          target_amount?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          agent_id?: string | null;
          business_id?: string;
          budget?: number | null;
          calling_hours?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          daily_call_cap?: number | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          max_attempts?: number | null;
          name?: string;
          retry_logic?: string | null;
          script?: string | null;
          start_date?: string | null;
          status?: string;
          target_amount?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
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
        ];
      };
      conversations: {
        Row: {
          agent_id: string | null;
          call_sid: string | null;
          campaign_id: string | null;
          created_at: string | null;
          created_by: string | null;
          duration_seconds: number | null;
          ended_at: string | null;
          id: string;
          key_points: Json | null;
          lead_id: string | null;
          notes: string | null;
          outcome: string | null;
          recording_url: string | null;
          sentiment_score: number | null;
          started_at: string | null;
          status: string;
          transcript: Json | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          agent_id?: string | null;
          call_sid?: string | null;
          campaign_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          duration_seconds?: number | null;
          ended_at?: string | null;
          id?: string;
          key_points?: Json | null;
          lead_id?: string | null;
          notes?: string | null;
          outcome?: string | null;
          recording_url?: string | null;
          sentiment_score?: number | null;
          started_at?: string | null;
          status?: string;
          transcript?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          agent_id?: string | null;
          call_sid?: string | null;
          campaign_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          duration_seconds?: number | null;
          ended_at?: string | null;
          id?: string;
          key_points?: Json | null;
          lead_id?: string | null;
          notes?: string | null;
          outcome?: string | null;
          recording_url?: string | null;
          sentiment_score?: number | null;
          started_at?: string | null;
          status?: string;
          transcript?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
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
            foreignKeyName: 'conversations_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
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
          business_id: string;
          config: Json | null;
          created_at: string | null;
          created_by: string | null;
          credentials: Json | null;
          description: string | null;
          id: string;
          last_sync_at: string | null;
          name: string;
          status: string;
          type: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          business_id: string;
          config?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          credentials?: Json | null;
          description?: string | null;
          id?: string;
          last_sync_at?: string | null;
          name: string;
          status?: string;
          type: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          business_id?: string;
          config?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          credentials?: Json | null;
          description?: string | null;
          id?: string;
          last_sync_at?: string | null;
          name?: string;
          status?: string;
          type?: string;
          updated_at?: string | null;
          updated_by?: string | null;
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
          attempts: number | null;
          campaign_id: string | null;
          company: string | null;
          created_at: string | null;
          created_by: string | null;
          donated_amount: number | null;
          email: string | null;
          id: string;
          last_contact_date: string | null;
          name: string;
          notes: string | null;
          phone: string | null;
          pledged_amount: number | null;
          status: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          attempts?: number | null;
          campaign_id?: string | null;
          company?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          donated_amount?: number | null;
          email?: string | null;
          id?: string;
          last_contact_date?: string | null;
          name: string;
          notes?: string | null;
          phone?: string | null;
          pledged_amount?: number | null;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          attempts?: number | null;
          campaign_id?: string | null;
          company?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          donated_amount?: number | null;
          email?: string | null;
          id?: string;
          last_contact_date?: string | null;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          pledged_amount?: number | null;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
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
          accepted_at: string | null;
          business_id: string;
          created_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          last_active_at: string | null;
          permissions: Json | null;
          role: string;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          business_id: string;
          created_at?: string | null;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          last_active_at?: string | null;
          permissions?: Json | null;
          role?: string;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          business_id?: string;
          created_at?: string | null;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          last_active_at?: string | null;
          permissions?: Json | null;
          role?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
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
            foreignKeyName: 'team_members_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      workflows: {
        Row: {
          agent_id: string | null;
          business_id: string;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          is_default: boolean | null;
          name: string;
          status: string;
          updated_at: string | null;
          updated_by: string | null;
          version: number | null;
        };
        Insert: {
          agent_id?: string | null;
          business_id: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_default?: boolean | null;
          name: string;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number | null;
        };
        Update: {
          agent_id?: string | null;
          business_id?: string;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_default?: boolean | null;
          name?: string;
          status?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          version?: number | null;
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
          condition: Json | null;
          created_at: string | null;
          edge_id: string | null;
          id: string;
          label: string | null;
          source_handle: string | null;
          source_node_id: string | null;
          target_handle: string | null;
          target_node_id: string | null;
          updated_at: string | null;
          workflow_id: string | null;
        };
        Insert: {
          condition?: Json | null;
          created_at?: string | null;
          edge_id?: string | null;
          id?: string;
          label?: string | null;
          source_handle?: string | null;
          source_node_id?: string | null;
          target_handle?: string | null;
          target_node_id?: string | null;
          updated_at?: string | null;
          workflow_id?: string | null;
        };
        Update: {
          condition?: Json | null;
          created_at?: string | null;
          edge_id?: string | null;
          id?: string;
          label?: string | null;
          source_handle?: string | null;
          source_node_id?: string | null;
          target_handle?: string | null;
          target_node_id?: string | null;
          updated_at?: string | null;
          workflow_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'workflow_edges_source_node_id_fkey';
            columns: ['source_node_id'];
            isOneToOne: false;
            referencedRelation: 'workflow_nodes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'workflow_edges_target_node_id_fkey';
            columns: ['target_node_id'];
            isOneToOne: false;
            referencedRelation: 'workflow_nodes';
            referencedColumns: ['id'];
          },
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
          config: Json | null;
          created_at: string | null;
          data: Json | null;
          id: string;
          name: string;
          node_id: string | null;
          position_x: number | null;
          position_y: number | null;
          type: string;
          updated_at: string | null;
          workflow_id: string | null;
        };
        Insert: {
          config?: Json | null;
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          name: string;
          node_id?: string | null;
          position_x?: number | null;
          position_y?: number | null;
          type: string;
          updated_at?: string | null;
          workflow_id?: string | null;
        };
        Update: {
          config?: Json | null;
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          name?: string;
          node_id?: string | null;
          position_x?: number | null;
          position_y?: number | null;
          type?: string;
          updated_at?: string | null;
          workflow_id?: string | null;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      agent_status: 'active' | 'inactive' | 'suspended';
      business_status: 'active' | 'inactive' | 'suspended';
      campaign_status: 'draft' | 'active' | 'paused' | 'completed';
      conversation_status: 'initiated' | 'in_progress' | 'completed' | 'failed';
      integration_status: 'active' | 'inactive' | 'error';
      lead_status: 'new' | 'contacted' | 'pledged' | 'failed';
      team_member_status: 'active' | 'invited' | 'suspended' | 'left';
      team_role: 'owner' | 'admin' | 'member' | 'viewer';
      voice_type: 'ai_generated' | 'custom';
      workflow_status: 'draft' | 'active' | 'archived';
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

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
