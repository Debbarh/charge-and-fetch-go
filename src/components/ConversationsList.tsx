import React, { useEffect, useState } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Chat from './Chat';

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

const ConversationsList = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
      subscribeToNewMessages();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get all conversations via messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          conversation_id,
          sender_id,
          receiver_id,
          content,
          created_at,
          read,
          request_id,
          offer_id
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation_id
      const conversationsMap = new Map<string, Conversation>();

      for (const msg of messages || []) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationsMap.has(msg.conversation_id)) {
          // Get other user's name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', otherId)
            .single();

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', msg.conversation_id)
            .eq('receiver_id', user.id)
            .eq('read', false);

          conversationsMap.set(msg.conversation_id, {
            conversation_id: msg.conversation_id,
            other_user_id: otherId,
            other_user_name: profile?.full_name || 'Utilisateur',
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: count || 0,
            request_id: msg.request_id,
            offer_id: msg.offer_id
          });
        }
      }

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
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
          table: 'messages'
        },
        (payload) => {
          const newMsg = payload.new as any;
          
          // Check if message involves current user
          if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
            loadConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (selectedConversation) {
    return (
      <Chat
        conversationId={selectedConversation.conversation_id}
        otherUserId={selectedConversation.other_user_id}
        otherUserName={selectedConversation.other_user_name}
        requestId={selectedConversation.request_id}
        offerId={selectedConversation.offer_id}
        onClose={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mes conversations
            </CardTitle>
            <CardDescription>
              Discutez avec les chauffeurs et clients
            </CardDescription>
          </div>
          {conversations.filter(c => c.unread_count > 0).length > 0 && (
            <Badge variant="destructive">
              {conversations.reduce((sum, c) => sum + c.unread_count, 0)} non lus
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement des conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Aucune conversation</p>
            <p className="text-sm text-muted-foreground mt-1">
              Les conversations apparaîtront ici
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.conversation_id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-electric-50"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-electric-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-electric-600" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {conversation.other_user_name}
                        </p>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.last_message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
