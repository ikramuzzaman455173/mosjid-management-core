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
      app_settings: {
        Row: {
          id: string
          default_nisab: number | null
          fitra_prices: Json | null
          prayer_city: string | null
          prayer_country: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          default_nisab?: number | null
          fitra_prices?: Json | null
          prayer_city?: string | null
          prayer_country?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          default_nisab?: number | null
          fitra_prices?: Json | null
          prayer_city?: string | null
          prayer_country?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      accounts: {
        Row: {
          account_no: string | null
          bank_name: string | null
          created_at: string | null
          current_balance: number | null
          id: string
          is_active: boolean | null
          kind: Database["public"]["Enums"]["account_kind"]
          name: string
          opening_balance: number | null
        }
        Insert: {
          account_no?: string | null
          bank_name?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          kind: Database["public"]["Enums"]["account_kind"]
          name: string
          opening_balance?: number | null
        }
        Update: {
          account_no?: string | null
          bank_name?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          is_active?: boolean | null
          kind?: Database["public"]["Enums"]["account_kind"]
          name?: string
          opening_balance?: number | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          category: string
          condition: Database["public"]["Enums"]["asset_condition"]
          created_at: string | null
          created_by: string | null
          current_value: number | null
          id: string
          location: string | null
          name: string
          notes: string | null
          photo_url: string | null
          purchase_date: string | null
          purchase_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          condition?: Database["public"]["Enums"]["asset_condition"]
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?: Database["public"]["Enums"]["asset_condition"]
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_email: string | null
          actor_user_id: string | null
          changes: Json | null
          created_at: string | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_email?: string | null
          actor_user_id?: string | null
          changes?: Json | null
          created_at?: string | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_email?: string | null
          actor_user_id?: string | null
          changes?: Json | null
          created_at?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      committee_members: {
        Row: {
          committee_id: string
          created_at: string | null
          id: string
          joined_at: string | null
          member_id: string
          position: Database["public"]["Enums"]["committee_position"]
        }
        Insert: {
          committee_id: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          member_id: string
          position?: Database["public"]["Enums"]["committee_position"]
        }
        Update: {
          committee_id?: string
          created_at?: string | null
          id?: string
          joined_at?: string | null
          member_id?: string
          position?: Database["public"]["Enums"]["committee_position"]
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      committees: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["committee_status"]
          tenure_end: string | null
          tenure_start: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["committee_status"]
          tenure_end?: string | null
          tenure_start: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["committee_status"]
          tenure_end?: string | null
          tenure_start?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          donation_date: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          kind: Database["public"]["Enums"]["donation_kind"]
          member_id: string | null
          notes: string | null
          receipt_no: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          donation_date?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["donation_kind"]
          member_id?: string | null
          notes?: string | null
          receipt_no?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          donation_date?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["donation_kind"]
          member_id?: string | null
          notes?: string | null
          receipt_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          account_id: string | null
          amount: number
          approved: boolean | null
          attachment_url: string | null
          bill_no: string | null
          category: string
          created_at: string | null
          created_by: string | null
          expense_date: string | null
          id: string
          notes: string | null
          vendor: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          approved?: boolean | null
          attachment_url?: string | null
          bill_no?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          expense_date?: string | null
          id?: string
          notes?: string | null
          vendor?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          approved?: boolean | null
          attachment_url?: string | null
          bill_no?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          expense_date?: string | null
          id?: string
          notes?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      income: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          id: string
          income_date: string | null
          notes: string | null
          source: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          income_date?: string | null
          notes?: string | null
          source?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          income_date?: string | null
          notes?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          current_stock: number
          id: string
          min_stock: number
          name: string
          notes: string | null
          unit: string
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          current_stock?: number
          id?: string
          min_stock?: number
          name: string
          notes?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          current_stock?: number
          id?: string
          min_stock?: number
          name?: string
          notes?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_attendance: {
        Row: {
          created_at: string | null
          id: string
          meeting_id: string
          member_id: string
          remarks: string | null
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_id: string
          member_id: string
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_id?: string
          member_id?: string
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_documents: {
        Row: {
          created_at: string | null
          file_name: string
          file_url: string
          id: string
          meeting_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_url: string
          id?: string
          meeting_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_url?: string
          id?: string
          meeting_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_documents_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          created_at: string | null
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["meeting_kind"]
          location: string | null
          meeting_date: string
          minutes: string | null
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          agenda?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["meeting_kind"]
          location?: string | null
          meeting_date: string
          minutes?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          agenda?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["meeting_kind"]
          location?: string | null
          meeting_date?: string
          minutes?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          id: string
          title: string | null
          description: string | null
          image_url: string
          category: string | null
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          image_url: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          image_url?: string
          category?: string | null
          created_at?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          address: string | null
          blood_group: string | null
          created_at: string | null
          created_by: string | null
          dob: string | null
          email: string | null
          father_name: string | null
          full_name: string
          id: string
          joining_date: string | null
          member_code: string | null
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          monthly_subscription: number | null
          mother_name: string | null
          nid: string | null
          notes: string | null
          occupation: string | null
          phone: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["member_status"] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          blood_group?: string | null
          created_at?: string | null
          created_by?: string | null
          dob?: string | null
          email?: string | null
          father_name?: string | null
          full_name: string
          id?: string
          joining_date?: string | null
          member_code?: string | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          monthly_subscription?: number | null
          mother_name?: string | null
          nid?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          blood_group?: string | null
          created_at?: string | null
          created_by?: string | null
          dob?: string | null
          email?: string | null
          father_name?: string | null
          full_name?: string
          id?: string
          joining_date?: string | null
          member_code?: string | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          monthly_subscription?: number | null
          mother_name?: string | null
          nid?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notices: {
        Row: {
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["notice_kind"] | null
          notice_date: string | null
          published: boolean | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notice_kind"] | null
          notice_date?: string | null
          published?: boolean | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notice_kind"] | null
          notice_date?: string | null
          published?: boolean | null
          title?: string
        }
        Relationships: []
      }
      prayer_times: {
        Row: {
          asr: string | null
          asr_iqamah: string | null
          created_at: string | null
          dhuhr: string | null
          dhuhr_iqamah: string | null
          effective_date: string
          fajr: string | null
          fajr_iqamah: string | null
          id: string
          isha: string | null
          isha_iqamah: string | null
          jummah: string | null
          maghrib: string | null
          maghrib_iqamah: string | null
          notes: string | null
        }
        Insert: {
          asr?: string | null
          asr_iqamah?: string | null
          created_at?: string | null
          dhuhr?: string | null
          dhuhr_iqamah?: string | null
          effective_date: string
          fajr?: string | null
          fajr_iqamah?: string | null
          id?: string
          isha?: string | null
          isha_iqamah?: string | null
          jummah?: string | null
          maghrib?: string | null
          maghrib_iqamah?: string | null
          notes?: string | null
        }
        Update: {
          asr?: string | null
          asr_iqamah?: string | null
          created_at?: string | null
          dhuhr?: string | null
          dhuhr_iqamah?: string | null
          effective_date?: string
          fajr?: string | null
          fajr_iqamah?: string | null
          id?: string
          isha?: string | null
          isha_iqamah?: string | null
          jummah?: string | null
          maghrib?: string | null
          maghrib_iqamah?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      qurbani_animals: {
        Row: {
          id: string
          type: string
          cost: number
          processing_cost: number | null
          vendor: string | null
          purchase_date: string | null
          total_shares: number
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          type: string
          cost: number
          processing_cost?: number | null
          vendor?: string | null
          purchase_date?: string | null
          total_shares?: number
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          type?: string
          cost?: number
          processing_cost?: number | null
          vendor?: string | null
          purchase_date?: string | null
          total_shares?: number
          created_at?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      qurbani_shares: {
        Row: {
          id: string
          animal_id: string
          member_name: string
          share_amount: number
          contact: string | null
          paid: boolean | null
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          animal_id: string
          member_name: string
          share_amount: number
          contact?: string | null
          paid?: boolean | null
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          animal_id?: string
          member_name?: string
          share_amount?: number
          contact?: string | null
          paid?: boolean | null
          created_at?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qurbani_shares_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "qurbani_animals"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          language: string | null
          email: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          email?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          email?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resolution_votes: {
        Row: {
          created_at: string | null
          id: string
          member_id: string
          resolution_id: string
          vote: Database["public"]["Enums"]["vote_choice"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id: string
          resolution_id: string
          vote: Database["public"]["Enums"]["vote_choice"]
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string
          resolution_id?: string
          vote?: Database["public"]["Enums"]["vote_choice"]
        }
        Relationships: [
          {
            foreignKeyName: "resolution_votes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolution_votes_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "resolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      resolutions: {
        Row: {
          committee_id: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          id: string
          meeting_id: string | null
          resolution_date: string | null
          status: Database["public"]["Enums"]["resolution_status"]
          title: string
        }
        Insert: {
          committee_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_id?: string | null
          resolution_date?: string | null
          status?: Database["public"]["Enums"]["resolution_status"]
          title: string
        }
        Update: {
          committee_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_id?: string | null
          resolution_date?: string | null
          status?: Database["public"]["Enums"]["resolution_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolutions_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolutions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          item_id: string
          kind: Database["public"]["Enums"]["stock_kind"]
          quantity: number
          reason: string | null
          txn_date: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id: string
          kind: Database["public"]["Enums"]["stock_kind"]
          quantity: number
          reason?: string | null
          txn_date?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string
          kind?: Database["public"]["Enums"]["stock_kind"]
          quantity?: number
          reason?: string | null
          txn_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          member_id: string
          month: number
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          receipt_no: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          year: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          member_id: string
          month: number
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          receipt_no?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          year: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          member_id?: string
          month?: number
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          receipt_no?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["txn_kind"]
          reference: string | null
          txn_date: string | null
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["txn_kind"]
          reference?: string | null
          txn_date?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["txn_kind"]
          reference?: string | null
          txn_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_finance: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_kind: "cash" | "bank" | "mobile_banking"
      app_role:
        | "super_admin"
        | "mosque_admin"
        | "imam"
        | "muazzin"
        | "treasurer"
        | "committee"
        | "auditor"
        | "member"
        | "volunteer"
      asset_condition: "good" | "fair" | "poor"
      attendance_status: "present" | "absent" | "late"
      audit_action: "insert" | "update" | "delete"
      committee_position:
        | "president"
        | "vice_president"
        | "secretary"
        | "joint_secretary"
        | "treasurer"
        | "member"
      committee_status: "active" | "expired" | "dissolved"
      donation_kind:
        | "general"
        | "jummah"
        | "zakat"
        | "sadaqah"
        | "fitra"
        | "ramadan"
        | "construction"
        | "qurbani"
        | "special"
      meeting_kind: "general" | "emergency" | "annual" | "committee"
      meeting_status: "scheduled" | "completed" | "cancelled"
      member_status: "active" | "inactive" | "suspended"
      membership_type: "general" | "permanent" | "honorary" | "founding"
      notice_kind: "general" | "emergency" | "event" | "meeting"
      resolution_status: "proposed" | "passed" | "rejected"
      stock_kind: "in" | "out"
      subscription_status: "paid" | "due" | "partial"
      txn_kind: "credit" | "debit" | "transfer"
      vote_choice: "yes" | "no" | "abstain"
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
  public: {
    Enums: {
      account_kind: ["cash", "bank", "mobile_banking"],
      app_role: [
        "super_admin",
        "mosque_admin",
        "imam",
        "muazzin",
        "treasurer",
        "committee",
        "auditor",
        "member",
        "volunteer",
      ],
      asset_condition: ["good", "fair", "poor"],
      attendance_status: ["present", "absent", "late"],
      audit_action: ["insert", "update", "delete"],
      committee_position: [
        "president",
        "vice_president",
        "secretary",
        "joint_secretary",
        "treasurer",
        "member",
      ],
      committee_status: ["active", "expired", "dissolved"],
      donation_kind: [
        "general",
        "jummah",
        "zakat",
        "sadaqah",
        "fitra",
        "ramadan",
        "construction",
        "qurbani",
        "special",
      ],
      meeting_kind: ["general", "emergency", "annual", "committee"],
      meeting_status: ["scheduled", "completed", "cancelled"],
      member_status: ["active", "inactive", "suspended"],
      membership_type: ["general", "permanent", "honorary", "founding"],
      notice_kind: ["general", "emergency", "event", "meeting"],
      resolution_status: ["proposed", "passed", "rejected"],
      stock_kind: ["in", "out"],
      subscription_status: ["paid", "due", "partial"],
      txn_kind: ["credit", "debit", "transfer"],
      vote_choice: ["yes", "no", "abstain"],
    },
  },
} as const
