import React, { useEffect, useState, useRef } from 'react';
import { Send, X, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
}

interface ChatInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiverId: string;
  receiverName: string;
  requestId?: string;
  offerId?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  open,
  onOpenChange,
  receiverId,
  receiverName,
  requestId,
  offerId
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationId = `${[user?.id, receiverId].sort().join('-')}-${requestId || offerId || 'general'}`;

  useEffect(() => {
    if (open && user) {
      loadMessages();
      subscribeToMessages();
      markMessagesAsRead();
    }
  }, [open, user, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data.map(msg => ({
        ...msg,
        sender_name: (msg.sender as any)?.full_name || 'Utilisateur'
      })));
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      toast.error('Impossible de charger les messages');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          // Load sender name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMsg.sender_id)
            .single();

          setMessages(prev => [...prev, {
            ...newMsg,
            sender_name: profile?.full_name || 'Utilisateur'
          }]);

          // Mark as read if from other user
          if (newMsg.sender_id !== user.id) {
            await supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('read', false);
    } catch (error) {
      console.error('Erreur marquage messages lus:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      setIsSending(true);
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId,
          request_id: requestId,
          offer_id: offerId,
          content: newMessage.trim(),
          read: false
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Impossible d\'envoyer le message');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-electric-600" />
            {receiverName}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-electric-600" />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Aucun message pour le moment</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Envoyez le premier message !
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isOwn
                              ? 'bg-electric-500 text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              {message.sender_name}
                            </p>
                          )}
                          <p className="text-sm break-words">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-white/70' : 'text-muted-foreground'
                            }`}
                          >
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                  className="bg-electric-500 hover:bg-electric-600"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ChatInterface;
