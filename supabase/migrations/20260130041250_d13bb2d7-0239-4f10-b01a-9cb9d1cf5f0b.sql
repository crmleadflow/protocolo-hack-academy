-- Enable pg_cron and pg_net extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule community content generation every 2 days at 10:00 AM UTC
SELECT cron.schedule(
  'community-scheduled-content-every-2-days',
  '0 10 */2 * *',
  $$
  SELECT net.http_post(
    url := 'https://mvyroxrmhqxtzljoryzi.supabase.co/functions/v1/community-scheduled-content',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eXJveHJtaHF4dHpsam9yeXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjk3NTksImV4cCI6MjA4NTIwNTc1OX0.AV1gDHtuoUa77C9rWzoiuRYWdEyqwyZ2y2dU098jdrk"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);