import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const isAlarmConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const supabase = isAlarmConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export async function triggerAlarm({ location, isFire, isFall }) {
    if (!supabase) {
        return {
            data: null,
            error: new Error(
                'Supabase alarm is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
            ),
        }
    }

    const { data, error } = await supabase
        .from('alarms')
        .insert({
            location,
            is_fire: isFire,
            is_fall: isFall,
        })
        .select()
        .single()

    return { data, error }
}
