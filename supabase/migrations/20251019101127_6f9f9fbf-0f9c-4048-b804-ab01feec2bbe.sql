-- Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES public.driver_offers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- Create conversations view for easier querying
CREATE OR REPLACE VIEW public.conversations AS
SELECT DISTINCT
  m.conversation_id,
  m.request_id,
  m.offer_id,
  CASE 
    WHEN m.sender_id = auth.uid() THEN m.receiver_id
    ELSE m.sender_id
  END as other_user_id,
  CASE 
    WHEN m.sender_id = auth.uid() THEN receiver_profile.full_name
    ELSE sender_profile.full_name
  END as other_user_name,
  (SELECT content FROM public.messages WHERE conversation_id = m.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT created_at FROM public.messages WHERE conversation_id = m.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message_at,
  (SELECT COUNT(*) FROM public.messages WHERE conversation_id = m.conversation_id AND receiver_id = auth.uid() AND NOT read) as unread_count
FROM public.messages m
LEFT JOIN public.profiles sender_profile ON m.sender_id = sender_profile.id
LEFT JOIN public.profiles receiver_profile ON m.receiver_id = receiver_profile.id
WHERE m.sender_id = auth.uid() OR m.receiver_id = auth.uid();

-- Trigger for updated_at
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;