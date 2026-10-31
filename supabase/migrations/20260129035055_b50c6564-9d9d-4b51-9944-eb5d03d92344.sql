-- Create direct messages table for admin-student communication
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for instant message updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Policy: Admins can send messages to anyone
CREATE POLICY "Admins can insert messages"
ON public.direct_messages
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = sender_id);

-- Policy: Students can send messages to admins
CREATE POLICY "Students can send messages to admins"
ON public.direct_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = recipient_id AND role = 'admin'
  )
);

-- Policy: Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
ON public.direct_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Policy: Users can update messages they received (mark as read)
CREATE POLICY "Recipients can mark messages as read"
ON public.direct_messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Policy: Admins can manage all messages
CREATE POLICY "Admins can manage all messages"
ON public.direct_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_direct_messages_updated_at
BEFORE UPDATE ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();