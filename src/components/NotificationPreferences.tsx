import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  notification_new_offers: boolean;
  notification_negotiations: boolean;
  notification_status_changes: boolean;
}

const NotificationPreferences = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    notification_new_offers: true,
    notification_negotiations: true,
    notification_status_changes: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications, push_notifications, notification_new_offers, notification_negotiations, notification_status_changes')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          notification_new_offers: data.notification_new_offers ?? true,
          notification_negotiations: data.notification_negotiations ?? true,
          notification_status_changes: data.notification_status_changes ?? true
        });
      }
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications: settings.email_notifications,
          push_notifications: settings.push_notifications,
          notification_new_offers: settings.notification_new_offers,
          notification_negotiations: settings.notification_negotiations,
          notification_status_changes: settings.notification_status_changes
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Préférences sauvegardées', {
        description: 'Vos préférences de notification ont été mises à jour'
      });
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      toast.error('Erreur', {
        description: 'Impossible de sauvegarder vos préférences'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-electric-600" />
          Préférences de notifications
        </CardTitle>
        <CardDescription>
          Gérez comment vous souhaitez être notifié des événements importants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canaux de notification */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Canaux de notification</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email-notifications" className="font-medium">
                  Notifications par email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des emails pour les événements importants
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.email_notifications}
              onCheckedChange={() => handleToggle('email_notifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="push-notifications" className="font-medium">
                  Notifications push
                </Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications dans l'application
                </p>
              </div>
            </div>
            <Switch
              id="push-notifications"
              checked={settings.push_notifications}
              onCheckedChange={() => handleToggle('push_notifications')}
            />
          </div>
        </div>

        <Separator />

        {/* Types de notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Types de notifications</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="new-offers" className="font-medium">
                  Nouvelles offres
                </Label>
                <p className="text-sm text-muted-foreground">
                  Être notifié quand vous recevez une nouvelle offre
                </p>
              </div>
            </div>
            <Switch
              id="new-offers"
              checked={settings.notification_new_offers}
              onCheckedChange={() => handleToggle('notification_new_offers')}
              disabled={!settings.email_notifications && !settings.push_notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="negotiations" className="font-medium">
                  Négociations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Être notifié des contre-offres et négociations
                </p>
              </div>
            </div>
            <Switch
              id="negotiations"
              checked={settings.notification_negotiations}
              onCheckedChange={() => handleToggle('notification_negotiations')}
              disabled={!settings.email_notifications && !settings.push_notifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="status-changes" className="font-medium">
                  Changements de statut
                </Label>
                <p className="text-sm text-muted-foreground">
                  Être notifié des mises à jour de demandes et courses
                </p>
              </div>
            </div>
            <Switch
              id="status-changes"
              checked={settings.notification_status_changes}
              onCheckedChange={() => handleToggle('notification_status_changes')}
              disabled={!settings.email_notifications && !settings.push_notifications}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-600 hover:to-electric-700"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
          </Button>
        </div>

        {(!settings.email_notifications && !settings.push_notifications) && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ Attention : Vous avez désactivé tous les canaux de notification. Vous ne recevrez aucune alerte.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
