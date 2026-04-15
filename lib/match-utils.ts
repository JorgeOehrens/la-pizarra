/**
 * Match derived status — computed from match_date + status.
 * Never stored in DB; always computed at runtime.
 */
export type MatchDerivedStatus = 'upcoming' | 'pending_result' | 'played' | 'cancelled'

export function getMatchDerivedStatus(
  status: string,
  matchDate: string
): MatchDerivedStatus {
  if (status === 'cancelled' || status === 'postponed') return 'cancelled'
  if (status === 'finished') return 'played'

  const date = new Date(matchDate)
  const now = new Date()

  if (date > now) return 'upcoming'
  return 'pending_result'
}
