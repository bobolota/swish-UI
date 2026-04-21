import { createClient } from '@supabase/supabase-js'

// L'application finale (le playground ou l'app de basket) fournira ces variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// On crée l'outil de connexion
export const supabase = createClient(supabaseUrl, supabaseAnonKey)