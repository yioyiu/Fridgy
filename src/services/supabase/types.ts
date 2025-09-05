export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          anonymous_id: string | null;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          notification_preferences: any;
          settings: any;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          anonymous_id?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          notification_preferences?: any;
          settings?: any;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          anonymous_id?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          notification_preferences?: any;
          settings?: any;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          color: string;
          default_shelf_life_days: number;
          near_expiry_threshold_days: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          color?: string;
          default_shelf_life_days?: number;
          near_expiry_threshold_days?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          color?: string;
          default_shelf_life_days?: number;
          near_expiry_threshold_days?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      units: {
        Row: {
          id: string;
          name: string;
          abbreviation: string | null;
          is_weight: boolean;
          is_volume: boolean;
          is_count: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          abbreviation?: string | null;
          is_weight?: boolean;
          is_volume?: boolean;
          is_count?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          abbreviation?: string | null;
          is_weight?: boolean;
          is_volume?: boolean;
          is_count?: boolean;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          color: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon?: string | null;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string | null;
          color?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      ingredients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category_id: string | null;
          quantity: number;
          unit_id: string | null;
          purchase_date: string | null;
          expiration_date: string;
          location_id: string | null;
          barcode: string | null;
          images: any;
          notes: string | null;
          status: string;
          freshness_score: number;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category_id?: string | null;
          quantity?: number;
          unit_id?: string | null;
          purchase_date?: string | null;
          expiration_date: string;
          location_id?: string | null;
          barcode?: string | null;
          images?: any;
          notes?: string | null;
          status?: string;
          freshness_score?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category_id?: string | null;
          quantity?: number;
          unit_id?: string | null;
          purchase_date?: string | null;
          expiration_date?: string;
          location_id?: string | null;
          barcode?: string | null;
          images?: any;
          notes?: string | null;
          status?: string;
          freshness_score?: number;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          ingredient_id: string | null;
          type: string;
          title: string;
          message: string | null;
          scheduled_for: string;
          is_recurring: boolean;
          recurrence_pattern: any | null;
          is_sent: boolean;
          sent_at: string | null;
          is_actioned: boolean;
          actioned_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ingredient_id?: string | null;
          type: string;
          title: string;
          message?: string | null;
          scheduled_for: string;
          is_recurring?: boolean;
          recurrence_pattern?: any | null;
          is_sent?: boolean;
          sent_at?: string | null;
          is_actioned?: boolean;
          actioned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ingredient_id?: string | null;
          type?: string;
          title?: string;
          message?: string | null;
          scheduled_for?: string;
          is_recurring?: boolean;
          recurrence_pattern?: any | null;
          is_sent?: boolean;
          sent_at?: string | null;
          is_actioned?: boolean;
          actioned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      consumption_history: {
        Row: {
          id: string;
          user_id: string;
          ingredient_id: string;
          quantity_consumed: number;
          consumption_date: string;
          consumption_type: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ingredient_id: string;
          quantity_consumed: number;
          consumption_date?: string;
          consumption_type?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ingredient_id?: string;
          quantity_consumed?: number;
          consumption_date?: string;
          consumption_type?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          barcode: string;
          name: string;
          brand: string | null;
          category_id: string | null;
          default_unit_id: string | null;
          default_shelf_life_days: number | null;
          image_url: string | null;
          nutrition_info: any | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          barcode: string;
          name: string;
          brand?: string | null;
          category_id?: string | null;
          default_unit_id?: string | null;
          default_shelf_life_days?: number | null;
          image_url?: string | null;
          nutrition_info?: any | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          barcode?: string;
          name?: string;
          brand?: string | null;
          category_id?: string | null;
          default_unit_id?: string | null;
          default_shelf_life_days?: number | null;
          image_url?: string | null;
          nutrition_info?: any | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sync_queue: {
        Row: {
          id: string;
          user_id: string;
          table_name: string;
          record_id: string;
          operation: string;
          data: any | null;
          priority: number;
          retry_count: number;
          max_retries: number;
          is_processed: boolean;
          processed_at: string | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          table_name: string;
          record_id: string;
          operation: string;
          data?: any | null;
          priority?: number;
          retry_count?: number;
          max_retries?: number;
          is_processed?: boolean;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          table_name?: string;
          record_id?: string;
          operation?: string;
          data?: any | null;
          priority?: number;
          retry_count?: number;
          max_retries?: number;
          is_processed?: boolean;
          processed_at?: string | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      ingredient_status_view: {
        Row: {
          id: string | null;
          user_id: string | null;
          name: string | null;
          category_id: string | null;
          category_name: string | null;
          quantity: number | null;
          unit_id: string | null;
          unit_name: string | null;
          expiration_date: string | null;
          status: string | null;
          freshness_score: number | null;
          calculated_status: string | null;
          days_to_expiry: number | null;
        };
      };
      user_statistics_view: {
        Row: {
          user_id: string | null;
          total_ingredients: number | null;
          fresh_count: number | null;
          near_expiry_count: number | null;
          expired_count: number | null;
          used_count: number | null;
          avg_freshness_score: number | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
