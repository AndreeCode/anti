import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pkkmbugchvfbymbyetas.supabase.co'
const supabaseKey = 'sb_publishable_ZVE6ydc1TzNYlrVtGlFqTw_foFvpozG'

export const supabase = createClient(supabaseUrl, supabaseKey)

