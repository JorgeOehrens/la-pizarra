-- Two versions of update_match share parameter names with the canonical
-- one, so PostgREST cannot resolve the function call (PGRST203) and the
-- edit-match form silently fails to save. Drop the legacy overloads and
-- the legacy create_match_with_events overloads while we're at it so
-- the schema cache stays unambiguous.

DROP FUNCTION IF EXISTS public.update_match(
  uuid, text, timestamp with time zone, text, boolean, text, text, text
);

DROP FUNCTION IF EXISTS public.update_match(
  uuid, text, timestamp with time zone, text, boolean, text, text, text, text
);

DROP FUNCTION IF EXISTS public.create_match_with_events(
  uuid, text, boolean, match_type, text, timestamp with time zone, text, smallint, jsonb
);

DROP FUNCTION IF EXISTS public.create_match_with_events(
  uuid, text, timestamp with time zone, text, boolean, text, text, text, jsonb
);
