-- Existing capability links remain valid; creating new attempts is disabled
-- until professional assignments are implemented in a later migration.
revoke execute on function public.start_test(text, text, jsonb, boolean) from public, anon, authenticated;
