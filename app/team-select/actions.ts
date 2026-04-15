'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function setActiveTeam(teamId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('set_active_team', { p_team_id: teamId })
  redirect('/home')
}
