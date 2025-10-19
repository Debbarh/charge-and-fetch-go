import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  roles: string[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurer l'écoute des changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Charger le profil et les rôles
          setTimeout(async () => {
            await loadUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      // Charger le profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Charger les rôles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      setProfile({
        id: userId,
        full_name: profileData.full_name,
        phone: profileData.phone,
        roles: rolesData.map(r => r.role)
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (role: string) => {
    return profile?.roles.includes(role) ?? false;
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    hasRole,
    isAuthenticated: !!user
  };
};
