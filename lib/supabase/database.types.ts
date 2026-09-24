export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_payments: {
        Row: {
          access_expires_at: string | null
          amount: number
          created_at: string | null
          currency: string | null
          customer_profile_id: string
          discount_amount: number | null
          discount_id: string | null
          final_amount: number
          id: string
          payment_id: string | null
          payment_provider: string | null
          status: string
        }
        Insert: {
          access_expires_at?: string | null
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_profile_id: string
          discount_amount?: number | null
          discount_id?: string | null
          final_amount: number
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          status?: string
        }
        Update: {
          access_expires_at?: string | null
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_profile_id?: string
          discount_amount?: number | null
          discount_id?: string | null
          final_amount?: number
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_payments_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_payments_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          starts_at: string | null
          target_role: string | null
          title: string
          type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          target_role?: string | null
          title: string
          type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          starts_at?: string | null
          target_role?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          companion_profile_id: string
          created_at: string | null
          day_of_week: string | null
          end_time: string | null
          id: string
          is_available: boolean | null
          notes: string | null
          start_time: string | null
        }
        Insert: {
          companion_profile_id: string
          created_at?: string | null
          day_of_week?: string | null
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          start_time?: string | null
        }
        Update: {
          companion_profile_id?: string
          created_at?: string | null
          day_of_week?: string | null
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_slots_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_payments: {
        Row: {
          amount: number
          booking_id: string
          companion_amount: number | null
          created_at: string | null
          currency: string | null
          customer_profile_id: string
          id: string
          payment_id: string | null
          payment_provider: string | null
          platform_fee: number | null
          status: string
        }
        Insert: {
          amount: number
          booking_id: string
          companion_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_profile_id: string
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          platform_fee?: number | null
          status?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          companion_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_profile_id?: string
          id?: string
          payment_id?: string | null
          payment_provider?: string | null
          platform_fee?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_payments_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          activity_type: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          category_id: string | null
          companion_notes: string | null
          companion_profile_id: string
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_notes: string | null
          customer_profile_id: string
          discount_amount: number | null
          duration_hours: number | null
          final_price: number | null
          id: string
          location_description: string | null
          message: string | null
          payment_status: string | null
          price: number | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          activity_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string | null
          companion_notes?: string | null
          companion_profile_id: string
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_notes?: string | null
          customer_profile_id: string
          discount_amount?: number | null
          duration_hours?: number | null
          final_price?: number | null
          id?: string
          location_description?: string | null
          message?: string | null
          payment_status?: string | null
          price?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string | null
          companion_notes?: string | null
          companion_profile_id?: string
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_notes?: string | null
          customer_profile_id?: string
          discount_amount?: number | null
          duration_hours?: number | null
          final_price?: number | null
          id?: string
          location_description?: string | null
          message?: string | null
          payment_status?: string | null
          price?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          sort_order: number | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          sort_order?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          sort_order?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      companion_categories: {
        Row: {
          category_id: string
          companion_profile_id: string
        }
        Insert: {
          category_id: string
          companion_profile_id: string
        }
        Update: {
          category_id?: string
          companion_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companion_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companion_categories_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companion_categories_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_interests: {
        Row: {
          companion_profile_id: string
          interest_id: string
        }
        Insert: {
          companion_profile_id: string
          interest_id: string
        }
        Update: {
          companion_profile_id?: string
          interest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companion_interests_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companion_interests_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companion_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_profiles: {
        Row: {
          availability_days: string[] | null
          availability_times: string[] | null
          avg_rating: number | null
          bio: string | null
          categories: string[] | null
          city: string | null
          created_at: string | null
          currency: string | null
          id: string
          interests: string[] | null
          is_discoverable: boolean | null
          is_visible: boolean | null
          languages: string[] | null
          onboarding_complete: boolean | null
          onboarding_step: number | null
          profile_id: string
          starting_price: number | null
          total_bookings: number | null
          total_earnings: number | null
          total_reviews: number | null
          updated_at: string | null
          verification_status: string
        }
        Insert: {
          availability_days?: string[] | null
          availability_times?: string[] | null
          avg_rating?: number | null
          bio?: string | null
          categories?: string[] | null
          city?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          interests?: string[] | null
          is_discoverable?: boolean | null
          is_visible?: boolean | null
          languages?: string[] | null
          onboarding_complete?: boolean | null
          onboarding_step?: number | null
          profile_id: string
          starting_price?: number | null
          total_bookings?: number | null
          total_earnings?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_status?: string
        }
        Update: {
          availability_days?: string[] | null
          availability_times?: string[] | null
          avg_rating?: number | null
          bio?: string | null
          categories?: string[] | null
          city?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          interests?: string[] | null
          is_discoverable?: boolean | null
          is_visible?: boolean | null
          languages?: string[] | null
          onboarding_complete?: boolean | null
          onboarding_step?: number | null
          profile_id?: string
          starting_price?: number | null
          total_bookings?: number | null
          total_earnings?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "companion_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_verification: {
        Row: {
          additional_docs: string[] | null
          admin_notes: string | null
          companion_profile_id: string
          created_at: string | null
          id: string
          id_document_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_url: string | null
          status: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          additional_docs?: string[] | null
          admin_notes?: string | null
          companion_profile_id: string
          created_at?: string | null
          id?: string
          id_document_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_docs?: string[] | null
          admin_notes?: string | null
          companion_profile_id?: string
          created_at?: string | null
          id?: string
          id_document_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companion_verification_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companion_verification_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companion_verification_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          slug: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_pages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          companion_profile_id: string
          created_at: string | null
          customer_profile_id: string
          id: string
          is_active: boolean | null
          last_message_at: string | null
          updated_at: string | null
        }
        Insert: {
          companion_profile_id: string
          created_at?: string | null
          customer_profile_id: string
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          updated_at?: string | null
        }
        Update: {
          companion_profile_id?: string
          created_at?: string | null
          customer_profile_id?: string
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          label: string | null
          name: string
          start_date: string | null
          type: string
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          name: string
          start_date?: string | null
          type: string
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          name?: string
          start_date?: string | null
          type?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "discounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          amount: number
          booking_payment_id: string | null
          companion_profile_id: string
          created_at: string | null
          currency: string | null
          id: string
          status: string
        }
        Insert: {
          amount: number
          booking_payment_id?: string | null
          companion_profile_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string
        }
        Update: {
          amount?: number
          booking_payment_id?: string | null
          companion_profile_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_booking_payment_id_fkey"
            columns: ["booking_payment_id"]
            isOneToOne: false
            referencedRelation: "booking_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_otps: {
        Row: {
          attempt_count: number
          created_at: string
          email: string
          expires_at: string
          id: string
          last_sent_at: string
          otp: string
          used: boolean
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          email: string
          expires_at: string
          id?: string
          last_sent_at?: string
          otp: string
          used?: boolean
        }
        Update: {
          attempt_count?: number
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          last_sent_at?: string
          otp?: string
          used?: boolean
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          companion_profile_id: string
          created_at: string | null
          customer_profile_id: string
          id: string
        }
        Insert: {
          companion_profile_id: string
          created_at?: string | null
          customer_profile_id: string
          id?: string
        }
        Update: {
          companion_profile_id?: string
          created_at?: string | null
          customer_profile_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          profile_id: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          profile_id: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          profile_id?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_account_details: Json | null
          companion_profile_id: string
          created_at: string | null
          currency: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_account_details?: Json | null
          companion_profile_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_account_details?: Json | null
          companion_profile_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_granted: boolean | null
          account_status: string
          age_confirmed: boolean | null
          bio: string | null
          city_id: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          display_name: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          hercules_user_id: string
          id: string
          is_admin: boolean | null
          languages: string[] | null
          last_login_at: string | null
          onboarding_complete: boolean | null
          password_hash: string | null
          phone: string | null
          profile_photo_url: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          access_granted?: boolean | null
          account_status?: string
          age_confirmed?: boolean | null
          bio?: string | null
          city_id?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          hercules_user_id: string
          id?: string
          is_admin?: boolean | null
          languages?: string[] | null
          last_login_at?: string | null
          onboarding_complete?: boolean | null
          password_hash?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          access_granted?: boolean | null
          account_status?: string
          age_confirmed?: boolean | null
          bio?: string | null
          city_id?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          hercules_user_id?: string
          id?: string
          is_admin?: boolean | null
          languages?: string[] | null
          last_login_at?: string | null
          onboarding_complete?: boolean | null
          password_hash?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          report_type: string
          reported_companion_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          report_type: string
          reported_companion_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          report_type?: string
          reported_companion_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_companion_id_fkey"
            columns: ["reported_companion_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_companion_id_fkey"
            columns: ["reported_companion_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          companion_profile_id: string
          created_at: string | null
          customer_profile_id: string
          id: string
          is_verified: boolean | null
          is_visible: boolean | null
          rating: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          companion_profile_id: string
          created_at?: string | null
          customer_profile_id: string
          id?: string
          is_verified?: boolean | null
          is_visible?: boolean | null
          rating: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          companion_profile_id?: string
          created_at?: string | null
          customer_profile_id?: string
          id?: string
          is_verified?: boolean | null
          is_visible?: boolean | null
          rating?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_companion_profile_id_fkey"
            columns: ["companion_profile_id"]
            isOneToOne: false
            referencedRelation: "public_companion_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          interest_id: string
          profile_id: string
        }
        Insert: {
          interest_id: string
          profile_id: string
        }
        Update: {
          interest_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_companion_profiles: {
        Row: {
          avg_rating: number | null
          bio: string | null
          categories: string[] | null
          city: string | null
          currency: string | null
          display_name: string | null
          id: string | null
          interests: string[] | null
          is_discoverable: boolean | null
          is_visible: boolean | null
          languages: string[] | null
          profile_id: string | null
          profile_photo_url: string | null
          starting_price: number | null
          total_reviews: number | null
          verification_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companion_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      companion_respond_to_booking: {
        Args: { p_accept: boolean; p_booking_id: string; p_note?: string }
        Returns: string
      }
      get_my_profile_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_service: { Args: never; Returns: boolean }
      issue_email_otp: {
        Args: { p_email: string; p_expires_at: string; p_otp: string }
        Returns: boolean
      }
      owns_profile: { Args: { p_id: string }; Returns: boolean }
      verify_email_otp: {
        Args: { p_email: string; p_otp: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
