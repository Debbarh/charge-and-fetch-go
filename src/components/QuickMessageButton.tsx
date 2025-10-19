import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface QuickMessageButtonProps {
  receiverId: string;
  receiverName: string;
  requestId?: string;
  offerId?: string;
  onChatOpen?: (conversationId: string) => void;
}

const QuickMessageButton: React.FC<QuickMessageButtonProps> = ({
  receiverId,
  receiverName,
  requestId,
  offerId,
  onChatOpen
}) => {
  const { user } = useAuth();

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      // Créer ou récupérer une conversation
      const conversationId = `${[user.id, receiverId].sort().join('_')}_${requestId || offerId || 'general'}`;

      // Vérifier si une conversation existe déjà
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('conversation_id', conversationId)
        .limit(1);

      if (!existingMessages || existingMessages.length === 0) {
        // Créer le premier message de la conversation
        const { error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            receiver_id: receiverId,
            request_id: requestId,
            offer_id: offerId,
            content: `Bonjour, je souhaite discuter avec vous concernant cette demande.`,
            read: false
          });

        if (error) throw error;
      }

      // Callback pour ouvrir le chat
      if (onChatOpen) {
        onChatOpen(conversationId);
      } else {
        toast.success('Conversation démarrée', {
          description: `Accédez à l'onglet Messages pour discuter avec ${receiverName}`
        });
      }
    } catch (error) {
      console.error('Erreur démarrage chat:', error);
      toast.error('Impossible de démarrer la conversation');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleStartChat}
      className="gap-2"
    >
      <MessageSquare className="h-4 w-4" />
      Contacter
    </Button>
  );
};

export default QuickMessageButton;
