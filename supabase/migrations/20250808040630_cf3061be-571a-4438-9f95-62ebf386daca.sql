-- Enable required extensions for scheduling and HTTP
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- Create or replace a daily cron job to invoke the public send-digest function at 09:00 UTC
select cron.schedule(
  'daily-send-digest',
  '0 9 * * *',
  $$
  select net.http_post(
    url := 'https://vcknhrcezuqeurkypqmc.supabase.co/functions/v1/send-digest',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := jsonb_build_object('scheduled_at', now())
  ) as request_id;
  $$
);
