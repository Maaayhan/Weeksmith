import type {
  ActorType,
  ChatRole,
  GoalType,
  PlanItemStatus,
  PlanMode,
} from "./db";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      vision: {
        Row: {
          daily: string;
          id: string;
          life: string;
          tags: string[];
          updated_at: string;
          user_id: string;
          weekly: string;
          year: string;
        };
        Insert: {
          daily?: string;
          id?: string;
          life?: string;
          tags?: string[];
          updated_at?: string;
          user_id: string;
          weekly?: string;
          year?: string;
        };
        Update: {
          daily?: string;
          id?: string;
          life?: string;
          tags?: string[];
          updated_at?: string;
          user_id?: string;
          weekly?: string;
          year?: string;
        };
        Relationships: [];
      };
      cycle: {
        Row: {
          created_at: string;
          current_week: number;
          end_date: string;
          id: string;
          start_date: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_week?: number;
          end_date: string;
          id?: string;
          start_date: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_week?: number;
          end_date?: string;
          id?: string;
          start_date?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      goal: {
        Row: {
          created_at: string;
          cycle_id: string;
          description: string;
          end_week: number;
          id: string;
          start_week: number;
          type: GoalType;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          cycle_id: string;
          description: string;
          end_week: number;
          id?: string;
          start_week: number;
          type: GoalType;
          user_id: string;
        };
        Update: {
          created_at?: string;
          cycle_id?: string;
          description?: string;
          end_week?: number;
          id?: string;
          start_week?: number;
          type?: GoalType;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goal_cycle_id_fkey";
            columns: ["cycle_id"];
            referencedRelation: "cycle";
            referencedColumns: ["id"];
          }
        ];
      };
      weekly_plan: {
        Row: {
          created_at: string;
          cycle_id: string;
          id: string;
          locked_after_week: number;
          mode: PlanMode;
          user_id: string;
          week_no: number;
        };
        Insert: {
          created_at?: string;
          cycle_id: string;
          id?: string;
          locked_after_week?: number;
          mode: PlanMode;
          user_id: string;
          week_no: number;
        };
        Update: {
          created_at?: string;
          cycle_id?: string;
          id?: string;
          locked_after_week?: number;
          mode?: PlanMode;
          user_id?: string;
          week_no?: number;
        };
        Relationships: [
          {
            foreignKeyName: "weekly_plan_cycle_id_fkey";
            columns: ["cycle_id"];
            referencedRelation: "cycle";
            referencedColumns: ["id"];
          }
        ];
      };
      task: {
        Row: {
          created_at: string;
          default_qty: number;
          id: string;
          tags: string[];
          title: string;
          unit: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          default_qty?: number;
          id?: string;
          tags?: string[];
          title: string;
          unit: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          default_qty?: number;
          id?: string;
          tags?: string[];
          title?: string;
          unit?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      plan_item: {
        Row: {
          completed_qty: number;
          created_at: string;
          goal_id: string | null;
          id: string;
          notes: string | null;
          plan_id: string;
          status: PlanItemStatus;
          task_id: string | null;
          unit: string;
          updated_at: string;
          qty: number;
        };
        Insert: {
          completed_qty?: number;
          created_at?: string;
          goal_id?: string | null;
          id?: string;
          notes?: string | null;
          plan_id: string;
          status?: PlanItemStatus;
          task_id?: string | null;
          unit: string;
          updated_at?: string;
          qty: number;
        };
        Update: {
          completed_qty?: number;
          created_at?: string;
          goal_id?: string | null;
          id?: string;
          notes?: string | null;
          plan_id?: string;
          status?: PlanItemStatus;
          task_id?: string | null;
          unit?: string;
          updated_at?: string;
          qty?: number;
        };
        Relationships: [
          {
            foreignKeyName: "plan_item_plan_id_fkey";
            columns: ["plan_id"];
            referencedRelation: "weekly_plan";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_item_goal_id_fkey";
            columns: ["goal_id"];
            referencedRelation: "goal";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_item_task_id_fkey";
            columns: ["task_id"];
            referencedRelation: "task";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_log: {
        Row: {
          action: string;
          actor_type: ActorType;
          actor_user_id: string | null;
          after_state: Json | null;
          before_state: Json | null;
          correlation_id: string | null;
          created_at: string;
          id: string;
          rationale: string | null;
          source_ip: string | null;
          subject_user_id: string;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          actor_type: ActorType;
          actor_user_id?: string | null;
          after_state?: Json | null;
          before_state?: Json | null;
          correlation_id?: string | null;
          created_at?: string;
          id?: string;
          rationale?: string | null;
          source_ip?: string | null;
          subject_user_id: string;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          actor_type?: ActorType;
          actor_user_id?: string | null;
          after_state?: Json | null;
          before_state?: Json | null;
          correlation_id?: string | null;
          created_at?: string;
          id?: string;
          rationale?: string | null;
          source_ip?: string | null;
          subject_user_id?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      chat_session: {
        Row: {
          cycle_id: string | null;
          id: string;
          started_at: string;
          summary_md: string | null;
          user_id: string;
          ended_at: string | null;
        };
        Insert: {
          cycle_id?: string | null;
          id?: string;
          started_at?: string;
          summary_md?: string | null;
          user_id: string;
          ended_at?: string | null;
        };
        Update: {
          cycle_id?: string | null;
          id?: string;
          started_at?: string;
          summary_md?: string | null;
          user_id?: string;
          ended_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_session_cycle_id_fkey";
            columns: ["cycle_id"];
            referencedRelation: "cycle";
            referencedColumns: ["id"];
          }
        ];
      };
      chat_message: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          proposal_json: Json | null;
          role: ChatRole;
          session_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          proposal_json?: Json | null;
          role: ChatRole;
          session_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          proposal_json?: Json | null;
          role?: ChatRole;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_message_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "chat_session";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      actor_type: ActorType;
      chat_role: ChatRole;
      goal_type: GoalType;
      plan_item_status: PlanItemStatus;
      plan_mode: PlanMode;
    };
  };
}
