-- Enable realtime for tables used in producer dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;