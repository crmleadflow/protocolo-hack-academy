-- Allow users to delete their own messages (sent or received)
CREATE POLICY "Users can delete own messages"
ON public.direct_messages
FOR DELETE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);