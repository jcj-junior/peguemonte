import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pkdsjgawgsklvuaowncz.supabase.co'
const supabaseAnonKey = 'sb_publishable_0EGr7lTag-6-oHfzbOLphg_Uxhbx1cv'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
