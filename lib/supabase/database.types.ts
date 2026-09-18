export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          hercules_user_id: string | null
          role: 'customer' | 'companion' | 'admin'
          full_name: string | null
          display_name: string | null
          email: string | null
          phone: string | null
          profile_photo_url: string | null
          date_of_birth: string | null
          age_confirmed: boolean | null
          country: string | null
          city_id: string | null
          bio: string | null
          languages: string[] | null
          account_status: 'active' | 'inactive' | 'suspended' | 'banned'
          is_admin: boolean | null
          onboarding_complete: boolean | null
          access_granted: boolean | null
          email_verified: boolean | null
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      companion_profiles: {
        Row: {
          id: string
          profile_id: string
          verification_status: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'suspended'
          is_visible: boolean | null
          is_discoverable: boolean | null
          starting_price: number | null
          currency: string | null
          bio: string | null
          languages: string[] | null
          categories: string[] | null
          interests: string[] | null
          city: string | null
          avg_rating: number | null
          total_reviews: number | null
          total_bookings: number | null
          total_earnings: number | null
          availability_days: string[] | null
          availability_times: string[] | null
          onboarding_complete: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['companion_profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['companion_profiles']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          customer_profile_id: string
          companion_profile_id: string
          category_id: string | null
          status: 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'cancelled' | 'completed' | 'disputed' | 'refunded'
          scheduled_date: string | null
          scheduled_time: string | null
          duration_hours: number | null
          location: string | null
          notes: string | null
          total_amount: number | null
          currency: string | null
          platform_fee: number | null
          companion_earnings: number | null
          cancelled_by: string | null
          cancellation_reason: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          customer_profile_id: string
          companion_profile_id: string
          booking_id: string | null
          last_message_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      favorites: {
        Row: {
          id: string
          customer_profile_id: string
          companion_profile_id: string
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['favorites']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          customer_profile_id: string
          companion_profile_id: string
          rating: number
          comment: string | null
          is_visible: boolean | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          profile_id: string
          type: string
          title: string
          body: string | null
          data: Json | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      cities: {
        Row: {
          id: string
          name: string
          state: string | null
          country: string | null
          is_active: boolean | null
          is_featured: boolean | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['cities']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['cities']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          is_active: boolean | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      access_payments: {
        Row: {
          id: string
          customer_profile_id: string
          amount: number | null
          currency: string | null
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_gateway: string | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['access_payments']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string }
        Update: Partial<Database['public']['Tables']['access_payments']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
