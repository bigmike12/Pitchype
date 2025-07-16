export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_role: 'business' | 'influencer' | 'admin'
          email: string | null
          first_name: string | null
          last_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_role?: 'business' | 'influencer' | 'admin'
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_role?: 'business' | 'influencer' | 'admin'
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      influencer_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          website: string | null
          instagram_handle: string | null
          youtube_handle: string | null
          tiktok_handle: string | null
          twitter_handle: string | null
          follower_count: number | null
          engagement_rate: number | null
          categories: string[] | null
          languages: string[] | null
          rate_per_post: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          instagram_handle?: string | null
          youtube_handle?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          follower_count?: number | null
          engagement_rate?: number | null
          categories?: string[] | null
          languages?: string[] | null
          rate_per_post?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          website?: string | null
          instagram_handle?: string | null
          youtube_handle?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          follower_count?: number | null
          engagement_rate?: number | null
          categories?: string[] | null
          languages?: string[] | null
          rate_per_post?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      business_profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          company_name: string | null
          company_description: string | null
          industry: string | null
          website_url: string | null
          address: string | null
          avatar_url: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          company_description?: string | null
          industry?: string | null
          website_url?: string | null
          address?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          company_name?: string | null
          company_description?: string | null
          industry?: string | null
          website_url?: string | null
          address?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          business_id: string
          title: string
          description: string | null
          requirements: string | null
          budget_min: number | null
          budget_max: number | null
          minimum_followers: number | null
          view_count: number
          deliverables: string[] | null
          target_audience: string | null
          campaign_goals: string[] | null
          platforms: string[] | null
          guidelines: string | null
          start_date: string | null
          end_date: string | null
          application_deadline: string | null
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          tags: string[] | null
          images: string[] | null
          required_influencers: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          title: string
          description?: string | null
          requirements?: string | null
          budget_min?: number | null
          budget_max?: number | null
          minimum_followers?: number | null
          view_count?: number
          deliverables?: string[] | null
          target_audience?: string | null
          campaign_goals?: string[] | null
          platforms?: string[] | null
          guidelines?: string | null
          start_date?: string | null
          end_date?: string | null
          application_deadline?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          tags?: string[] | null
          images?: string[] | null
          required_influencers?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          title?: string
          description?: string | null
          requirements?: string | null
          budget_min?: number | null
          budget_max?: number | null
          minimum_followers?: number | null
          view_count?: number
          deliverables?: string[] | null
          target_audience?: string | null
          campaign_goals?: string[] | null
          platforms?: string[] | null
          guidelines?: string | null
          start_date?: string | null
          end_date?: string | null
          application_deadline?: string | null
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          tags?: string[] | null
          images?: string[] | null
          required_influencers?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          proposal: string | null
          proposed_rate: number | null
          estimated_reach: number | null
          portfolio_links: string[] | null
          status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'submitted' | 'completed' | 'revision_requested'
          work_submitted_at: string | null
          auto_approve_date: string | null
          submitted_at: string
          reviewed_at: string | null
          review_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          influencer_id: string
          proposal?: string | null
          proposed_rate?: number | null
          estimated_reach?: number | null
          portfolio_links?: string[] | null
          status?: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'submitted' | 'completed' | 'revision_requested'
          work_submitted_at?: string | null
          auto_approve_date?: string | null
          submitted_at?: string
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          influencer_id?: string
          proposal?: string | null
          proposed_rate?: number | null
          estimated_reach?: number | null
          portfolio_links?: string[] | null
          status?: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'submitted' | 'completed' | 'revision_requested'
          submitted_at?: string
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          application_id: string
          sender_id: string
          content: string | null
          message_type: 'text' | 'image' | 'file' | 'system'
          attachments: any | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          sender_id: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file' | 'system'
          attachments?: any | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          sender_id?: string
          content?: string | null
          message_type?: 'text' | 'image' | 'file' | 'system'
          attachments?: any | null
          is_read?: boolean
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          application_id: string
          amount: number
          currency: string
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'in_escrow'
          stripe_payment_intent_id: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'in_escrow'
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          stripe_payment_intent_id?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaign_favorites: {
        Row: {
          id: string
          influencer_id: string
          campaign_id: string
          created_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          campaign_id: string
          created_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          campaign_id?: string
          created_at?: string
        }
      }
      escrow_accounts: {
        Row: {
          id: string
          application_id: string
          payment_id: string
          amount: number
          currency: string
          status: 'held' | 'released' | 'refunded'
          held_at: string
          released_at: string | null
          auto_release_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          payment_id: string
          amount: number
          currency?: string
          status?: 'held' | 'released' | 'refunded'
          held_at?: string
          released_at?: string | null
          auto_release_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          payment_id?: string
          amount?: number
          currency?: string
          status?: 'held' | 'released' | 'refunded'
          held_at?: string
          released_at?: string | null
          auto_release_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      influencer_balances: {
        Row: {
          id: string
          influencer_id: string
          available_balance: number
          pending_balance: number
          total_earned: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          available_balance?: number
          pending_balance?: number
          total_earned?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          available_balance?: number
          pending_balance?: number
          total_earned?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      payout_requests: {
        Row: {
          id: string
          influencer_id: string
          amount: number
          platform_fee: number
          net_amount: number
          currency: string
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          payment_method: any | null
          paystack_transfer_id: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          amount: number
          platform_fee: number
          net_amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          payment_method?: any | null
          paystack_transfer_id?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          amount?: number
          platform_fee?: number
          net_amount?: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          payment_method?: any | null
          paystack_transfer_id?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      platform_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: any
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: any
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: any
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaign_analytics: {
        Row: {
          id: string
          application_id: string
          influencer_id: string
          campaign_id: string
          platform: string
          post_url: string
          post_type: string
          views_count: number | null
          likes_count: number | null
          comments_count: number | null
          shares_count: number | null
          saves_count: number | null
          reach_count: number | null
          impressions_count: number | null
          engagement_rate: number | null
          click_through_rate: number | null
          screenshot_urls: string[] | null
          additional_notes: string | null
          submitted_at: string
          verification_status: 'pending' | 'verified' | 'rejected' | 'disputed'
          verified_by: string | null
          verified_at: string | null
          verification_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          influencer_id: string
          campaign_id: string
          platform: string
          post_url: string
          post_type: string
          views_count?: number | null
          likes_count?: number | null
          comments_count?: number | null
          shares_count?: number | null
          saves_count?: number | null
          reach_count?: number | null
          impressions_count?: number | null
          engagement_rate?: number | null
          click_through_rate?: number | null
          screenshot_urls?: string[] | null
          additional_notes?: string | null
          submitted_at?: string
          verification_status?: 'pending' | 'verified' | 'rejected' | 'disputed'
          verified_by?: string | null
          verified_at?: string | null
          verification_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          influencer_id?: string
          campaign_id?: string
          platform?: string
          post_url?: string
          post_type?: string
          views_count?: number | null
          likes_count?: number | null
          comments_count?: number | null
          shares_count?: number | null
          saves_count?: number | null
          reach_count?: number | null
          impressions_count?: number | null
          engagement_rate?: number | null
          click_through_rate?: number | null
          screenshot_urls?: string[] | null
          additional_notes?: string | null
          submitted_at?: string
          verification_status?: 'pending' | 'verified' | 'rejected' | 'disputed'
          verified_by?: string | null
          verified_at?: string | null
          verification_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_media_verifications: {
        Row: {
          id: string
          influencer_id: string
          platform: string
          username: string
          profile_url: string
          follower_count: number | null
          verification_screenshot_url: string | null
          verification_video_url: string | null
          verification_code: string | null
          status: 'pending' | 'approved' | 'rejected' | 'expired'
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          is_verified: boolean
          verified_at: string | null
          verification_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          platform: string
          username: string
          profile_url: string
          follower_count?: number | null
          verification_screenshot_url?: string | null
          verification_video_url?: string | null
          verification_code?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'expired'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          is_verified?: boolean
          verified_at?: string | null
          verification_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          platform?: string
          username?: string
          profile_url?: string
          follower_count?: number | null
          verification_screenshot_url?: string | null
          verification_video_url?: string | null
          verification_code?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'expired'
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          is_verified?: boolean
          verified_at?: string | null
          verification_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      influencer_bank_details: {
        Row: {
          id: string
          influencer_id: string
          bank_name: string
          account_name: string
          account_holder_name: string
          account_number: string
          routing_number: string | null
          swift_code: string | null
          bank_address: string | null
          account_holder_address: string | null
          currency: string
          account_type: 'checking' | 'savings' | 'business'
          is_verified: boolean
          verified_at: string | null
          verification_method: string | null
          is_active: boolean
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          influencer_id: string
          bank_name: string
          account_name: string
          account_holder_name: string
          account_number: string
          routing_number?: string | null
          swift_code?: string | null
          bank_address?: string | null
          account_holder_address?: string | null
          currency?: string
          account_type?: 'checking' | 'savings' | 'business'
          is_verified?: boolean
          verified_at?: string | null
          verification_method?: string | null
          is_active?: boolean
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          influencer_id?: string
          bank_name?: string
          account_name?: string
          account_holder_name?: string
          account_number?: string
          routing_number?: string | null
          swift_code?: string | null
          bank_address?: string | null
          account_holder_address?: string | null
          currency?: string
          account_type?: 'checking' | 'savings' | 'business'
          is_verified?: boolean
          verified_at?: string | null
          verification_method?: string | null
          is_active?: boolean
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      influencer_reviews: {
        Row: {
          id: string
          campaign_id: string
          business_id: string
          influencer_id: string
          application_id: string | null
          overall_rating: number
          communication_rating: number | null
          content_quality_rating: number | null
          professionalism_rating: number | null
          timeliness_rating: number | null
          review_title: string | null
          review_text: string | null
          would_work_again: boolean
          is_public: boolean
          is_featured: boolean
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          business_id: string
          influencer_id: string
          application_id?: string | null
          overall_rating: number
          communication_rating?: number | null
          content_quality_rating?: number | null
          professionalism_rating?: number | null
          timeliness_rating?: number | null
          review_title?: string | null
          review_text?: string | null
          would_work_again?: boolean
          is_public?: boolean
          is_featured?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          business_id?: string
          influencer_id?: string
          application_id?: string | null
          overall_rating?: number
          communication_rating?: number | null
          content_quality_rating?: number | null
          professionalism_rating?: number | null
          timeliness_rating?: number | null
          review_title?: string | null
          review_text?: string | null
          would_work_again?: boolean
          is_public?: boolean
          is_featured?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
      Row: {
        id: string
        application_id: string
        influencer_id: string
        campaign_id: string
        business_id: string
        title: string | null
        description: string | null
        notes: string | null
        images: Json
        videos: Json
        links: Json
        documents: Json
        attachments: Json
        status: string
        review_notes: string | null
        revision_notes: string | null
        submitted_at: string
        reviewed_at: string | null
        auto_approve_date: string | null
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        application_id: string
        influencer_id: string
        campaign_id: string
        business_id: string
        title?: string | null
        description?: string | null
        notes?: string | null
        images?: Json
        videos?: Json
        links?: Json
        documents?: Json
        attachments?: Json
        status?: string
        review_notes?: string | null
        revision_notes?: string | null
        submitted_at?: string
        reviewed_at?: string | null
        auto_approve_date?: string | null
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        application_id?: string
        influencer_id?: string
        campaign_id?: string
        business_id?: string
        title?: string | null
        description?: string | null
        notes?: string | null
        images?: Json
        videos?: Json
        links?: Json
        documents?: Json
        attachments?: Json
        status?: string
        review_notes?: string | null
        revision_notes?: string | null
        submitted_at?: string
        reviewed_at?: string | null
        auto_approve_date?: string | null
        created_at?: string
        updated_at?: string
      }
      Relationships: [
        {
          foreignKeyName: "submissions_application_id_fkey"
          columns: ["application_id"]
          isOneToOne: true
          referencedRelation: "applications"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "submissions_influencer_id_fkey"
          columns: ["influencer_id"]
          isOneToOne: false
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "submissions_campaign_id_fkey"
          columns: ["campaign_id"]
          isOneToOne: false
          referencedRelation: "campaigns"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "submissions_business_id_fkey"
          columns: ["business_id"]
          isOneToOne: false
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ]}
    }
    Views: {
      // Define your database views here
    }
    Functions: {
      // Define your database functions here
    }
    Enums: {
      user_role: 'business' | 'influencer' | 'admin'
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled' | 'in-progress'
      application_status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'submitted' | 'completed' | 'revision_requested'
      payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'in_escrow'
    }
  }
}