import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { features } from '@/lib/features'
import { track } from '@/lib/analytics'
import { CreateLeagueForm } from './create-league-form'

export default async function CreateLeaguePage() {
  // Auth first so we can attach the user id to the gating event.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Pro Liga is gated during validation. Send the user to the waitlist
  // section of /para-ligas and record the gating event so we can compute
  // the funnel "league intent → waitlist conversion".
  if (!features.leagues) {
    void track(
      'league_create_blocked',
      { reason: 'flag_off' },
      { distinctId: user.id },
    ).catch(() => undefined)
    redirect('/para-ligas?ref=onboarding#waitlist')
  }

  return <CreateLeagueForm />
}
