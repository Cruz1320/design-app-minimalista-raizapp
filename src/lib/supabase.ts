import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso geral (server-side e client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Cliente específico para componentes React (client-side)
export const createSupabaseClient = () => {
  return createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey
  })
}

// Types
export interface UserProfile {
  id: string
  full_name: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface QuizResponse {
  id: string
  user_id: string
  question_id: number
  question_text: string
  answer: string
  created_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  title: string
  description: string | null
  activity_type: string
  created_at: string
}
