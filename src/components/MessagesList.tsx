import React, { useEffect, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import ChatInterface from './ChatInterface';

interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  request_id?: string;
  offer_id?: string;
}

const MessagesList = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations();
      subscribeToNewMessages();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name),
          receiver:profiles!messages_receiver_id_fkey(id, full_name)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationsMap = new Map<string, Conversation>();

      messages?.forEach((msg: any) => {
        if (!conversationsMap.has(msg.conversation_id)) {
          const isReceiver = msg.receiver_id === user.id;
          const otherUser = isReceiver ? msg.sender : msg.receiver;

          conversationsMap.set(msg.conversation_id, {
            conversation_id: msg.conversation_id,
            other_user_id: otherUser.id,
            other_user_name: otherUser.full_name || 'Utilisateur',
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0,
            request_id: msg.request_id,
            offer_id: msg.offer_id
          });
        }
      });

      for (const conv of conversationsMap.values()) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.conversation_id)
          .eq('receiver_id', user.id)
          .eq('read', false);

        conv.unread_count = count || 0;
      }

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    }
  };

  const subscribeToNewMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const openChat = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setChatOpen(true);
  };

  const handleChatClose = (open: boolean) => {
    setChatOpen(open);
    if (!open) {
      loadConversations();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-electric-600" />
            Messages
            {conversations.reduce((sum, c) => sum + c.unread_count, 0) > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune conversation</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.conversation_id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      conversation.unread_count > 0 ? 'bg-electric-50 border-electric-200' : ''
                    }`}
                    onClick={() => openChat(conversation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {conversation.other_user_name}
                            </h4>
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(conversation.last_message_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </p>
                        </div>
                        <MessageCircle className="h-5 w-5 text-electric-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedConversation && (
        <ChatInterface
          open={chatOpen}
          onOpenChange={handleChatClose}
          receiverId={selectedConversation.other_user_id}
          receiverName={selectedConversation.other_user_name}
          requestId={selectedConversation.request_id}
          offerId={selectedConversation.offer_id}
        />
      )}
    </>
  );
};

export default MessagesList;
