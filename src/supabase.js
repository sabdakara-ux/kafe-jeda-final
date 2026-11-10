import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.https://zlgxfaxzswrsuztyecfw.supabase.co/rest/v1/

const supabaseAnonKey = import.meta.env.sb_publishable_pfcxXFwedZOuCEbxFWA_Tw__nuI68dK

export const supabase = createClient(supabaseUrl, supabaseAnonKey)