
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCheckingSession(false);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!checkingSession && !session) {
      navigate('/auth');
    }
  }, [session, checkingSession, navigate]);

  return { session, checkingSession };
};
