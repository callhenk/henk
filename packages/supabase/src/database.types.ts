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
        Relationships: [];
      };
      agents: {
        Row: {
          business_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          knowledge_base: Json | null;
          name: string;
          status: string;
          updated_at: string | null;
          voice_id: string | null;
          voice_type: string | null;
        };
        Insert: {
          business_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          knowledge_base?: Json | null;
          name: string;
          status?: string;
          updated_at?: string | null;
          voice_id?: string | null;
          voice_type?: string | null;
        };
        Update: {
          business_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          knowledge_base?: Json | null;
          name?: string;
          status?: string;
          updated_at?: string | null;
          voice_id?: string | null;
          voice_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'agents_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
        ];
      };
      businesses: {
        Row: {
          account_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          account_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          agent_id: string | null;
          business_id: string;
          calling_hours: string | null;
          created_at: string | null;
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
          updated_at: string | null;
        };
        Insert: {
          agent_id?: string | null;
          business_id: string;
          calling_hours?: string | null;
          created_at?: string | null;
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
          updated_at?: string | null;
        };
        Update: {
          agent_id?: string | null;
          business_id?: string;
          calling_hours?: string | null;
          created_at?: string | null;
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
          updated_at?: string | null;
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
        ];
      };
      conversations: {
        Row: {
          agent_id: string | null;
          campaign_id: string | null;
          created_at: string | null;
          duration: number | null;
          id: string;
          lead_id: string | null;
          notes: string | null;
          outcome: string | null;
          recording_url: string | null;
          status: string;
          transcript: Json | null;
          updated_at: string | null;
        };
        Insert: {
          agent_id?: string | null;
          campaign_id?: string | null;
          created_at?: string | null;
          duration?: number | null;
          id?: string;
          lead_id?: string | null;
          notes?: string | null;
          outcome?: string | null;
          recording_url?: string | null;
          status?: string;
          transcript?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          agent_id?: string | null;
          campaign_id?: string | null;
          created_at?: string | null;
          duration?: number | null;
          id?: string;
          lead_id?: string | null;
          notes?: string | null;
          outcome?: string | null;
          recording_url?: string | null;
          status?: string;
          transcript?: Json | null;
          updated_at?: string | null;
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
            foreignKeyName: 'conversations_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
        ];
      };
      integrations: {
        Row: {
          business_id: string;
          config: Json | null;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          status: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          business_id: string;
          config?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          status?: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          business_id?: string;
          config?: Json | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          status?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'integrations_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
        ];
      };
      leads: {
        Row: {
          campaign_id: string | null;
          company: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          notes: string | null;
          phone: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          campaign_id?: string | null;
          company?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          notes?: string | null;
          phone?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          campaign_id?: string | null;
          company?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          notes?: string | null;
          phone?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'leads_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
        ];
      };
      team_members: {
        Row: {
          business_id: string;
          created_at: string | null;
          id: string;
          role: string;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          business_id: string;
          created_at?: string | null;
          id?: string;
          role?: string;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          business_id?: string;
          created_at?: string | null;
          id?: string;
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
        ];
      };
      workflows: {
        Row: {
          agent_id: string | null;
          business_id: string;
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          agent_id?: string | null;
          business_id: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          agent_id?: string | null;
          business_id?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          status?: string;
          updated_at?: string | null;
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
            foreignKeyName: 'workflows_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
        ];
      };
      workflow_edges: {
        Row: {
          created_at: string | null;
          id: string;
          source_node_id: string | null;
          target_node_id: string | null;
          workflow_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          source_node_id?: string | null;
          target_node_id?: string | null;
          workflow_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          source_node_id?: string | null;
          target_node_id?: string | null;
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
          id: string;
          name: string;
          type: string;
          workflow_id: string | null;
          x_position: number | null;
          y_position: number | null;
        };
        Insert: {
          config?: Json | null;
          created_at?: string | null;
          id?: string;
          name: string;
          type: string;
          workflow_id?: string | null;
          x_position?: number | null;
          y_position?: number | null;
        };
        Update: {
          config?: Json | null;
          created_at?: string | null;
          id?: string;
          name?: string;
          type?: string;
          workflow_id?: string | null;
          x_position?: number | null;
          y_position?: number | null;
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
      business_status: 'active' | 'inactive' | 'suspended';
      team_member_status: 'active' | 'invited' | 'suspended' | 'left';
      team_role: 'owner' | 'admin' | 'member' | 'viewer';
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
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName]['Insert']
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions]['Insert']
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName]['Update']
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions]['Update']
    : never;
