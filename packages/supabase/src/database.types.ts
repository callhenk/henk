export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
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
        Relationships: [];
      };
      agents: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'active' | 'inactive' | 'agent_paused' | 'training';
          account_id: string;
          voice_type: 'ai_generated' | 'custom';
          voice_id: string | null;
          speaking_tone: string;
          organization_info: string | null;
          donor_context: string | null;
          faqs: Json;
          knowledge_base: Json;
          workflow_config: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: 'active' | 'inactive' | 'agent_paused' | 'training';
          account_id: string;
          voice_type?: 'ai_generated' | 'custom';
          voice_id?: string | null;
          speaking_tone?: string;
          organization_info?: string | null;
          donor_context?: string | null;
          faqs?: Json;
          knowledge_base?: Json;
          workflow_config?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: 'active' | 'inactive' | 'agent_paused' | 'training';
          account_id?: string;
          voice_type?: 'ai_generated' | 'custom';
          voice_id?: string | null;
          speaking_tone?: string;
          organization_info?: string | null;
          donor_context?: string | null;
          faqs?: Json;
          knowledge_base?: Json;
          workflow_config?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'agents_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          account_id: string;
          agent_id: string | null;
          start_date: string | null;
          end_date: string | null;
          calling_hours: string;
          max_attempts: number;
          daily_call_cap: number;
          script: string;
          retry_logic: string;
          budget: number | null;
          target_amount: number | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          account_id: string;
          agent_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          calling_hours?: string;
          max_attempts?: number;
          daily_call_cap?: number;
          script: string;
          retry_logic?: string;
          budget?: number | null;
          target_amount?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          account_id?: string;
          agent_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          calling_hours?: string;
          max_attempts?: number;
          daily_call_cap?: number;
          script?: string;
          retry_logic?: string;
          budget?: number | null;
          target_amount?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'campaigns_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'campaigns_agent_id_fkey';
            columns: ['agent_id'];
            isOneToOne: false;
            referencedRelation: 'agents';
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
          status: 'draft' | 'active' | 'inactive';
          version: number;
          is_default: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          agent_id: string;
          status?: 'draft' | 'active' | 'inactive';
          version?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          agent_id?: string;
          status?: 'draft' | 'active' | 'inactive';
          version?: number;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
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
        ];
      };
      workflow_nodes: {
        Row: {
          id: string;
          workflow_id: string;
          node_id: string;
          type: 'start' | 'condition' | 'action' | 'end';
          position_x: number;
          position_y: number;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workflow_id: string;
          node_id: string;
          type: 'start' | 'condition' | 'action' | 'end';
          position_x: number;
          position_y: number;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workflow_id?: string;
          node_id?: string;
          type?: 'start' | 'condition' | 'action' | 'end';
          position_x?: number;
          position_y?: number;
          data?: Json;
          created_at?: string;
          updated_at?: string;
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
          created_at: string;
          updated_at: string;
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
          created_at?: string;
          updated_at?: string;
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
          created_at?: string;
          updated_at?: string;
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
      leads: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          email: string | null;
          phone: string;
          company: string | null;
          status:
            | 'new'
            | 'contacted'
            | 'interested'
            | 'pledged'
            | 'donated'
            | 'not_interested'
            | 'unreachable'
            | 'failed';
          notes: string | null;
          last_contact_date: string | null;
          attempts: number;
          pledged_amount: number | null;
          donated_amount: number | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          email?: string | null;
          phone: string;
          company?: string | null;
          status?:
            | 'new'
            | 'contacted'
            | 'interested'
            | 'pledged'
            | 'donated'
            | 'not_interested'
            | 'unreachable'
            | 'failed';
          notes?: string | null;
          last_contact_date?: string | null;
          attempts?: number;
          pledged_amount?: number | null;
          donated_amount?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          company?: string | null;
          status?:
            | 'new'
            | 'contacted'
            | 'interested'
            | 'pledged'
            | 'donated'
            | 'not_interested'
            | 'unreachable'
            | 'failed';
          notes?: string | null;
          last_contact_date?: string | null;
          attempts?: number;
          pledged_amount?: number | null;
          donated_amount?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
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
        ];
      };
      conversations: {
        Row: {
          id: string;
          campaign_id: string;
          agent_id: string;
          lead_id: string;
          status:
            | 'initiated'
            | 'in_progress'
            | 'completed'
            | 'failed'
            | 'no_answer';
          duration_seconds: number | null;
          call_sid: string | null;
          recording_url: string | null;
          transcript: string | null;
          sentiment_score: number | null;
          key_points: Json;
          outcome: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          agent_id: string;
          lead_id: string;
          status?:
            | 'initiated'
            | 'in_progress'
            | 'completed'
            | 'failed'
            | 'no_answer';
          duration_seconds?: number | null;
          call_sid?: string | null;
          recording_url?: string | null;
          transcript?: string | null;
          sentiment_score?: number | null;
          key_points?: Json;
          outcome?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          agent_id?: string;
          lead_id?: string;
          status?:
            | 'initiated'
            | 'in_progress'
            | 'completed'
            | 'failed'
            | 'no_answer';
          duration_seconds?: number | null;
          call_sid?: string | null;
          recording_url?: string | null;
          transcript?: string | null;
          sentiment_score?: number | null;
          key_points?: Json;
          outcome?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
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
        ];
      };
      integrations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: 'crm' | 'email' | 'payment' | 'analytics' | 'other';
          status: 'active' | 'inactive' | 'error' | 'pending';
          account_id: string;
          config: Json;
          credentials: Json;
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type: 'crm' | 'email' | 'payment' | 'analytics' | 'other';
          status?: 'active' | 'inactive' | 'error' | 'pending';
          account_id: string;
          config?: Json;
          credentials?: Json;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: 'crm' | 'email' | 'payment' | 'analytics' | 'other';
          status?: 'active' | 'inactive' | 'error' | 'pending';
          account_id?: string;
          config?: Json;
          credentials?: Json;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'integrations_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
        };
        Returns: {
          key: string;
          id: string;
          created_at: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          prefix_param: string;
          delimiter_param: string;
          max_keys?: number;
          start_after?: string;
          next_token?: string;
        };
        Returns: {
          name: string;
          id: string;
          metadata: Json;
          updated_at: string;
        }[];
      };
      operation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
