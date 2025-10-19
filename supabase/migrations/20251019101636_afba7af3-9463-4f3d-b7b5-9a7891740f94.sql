-- Drop the existing view
DROP VIEW IF EXISTS public.conversations;

-- Recreate without SECURITY DEFINER
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