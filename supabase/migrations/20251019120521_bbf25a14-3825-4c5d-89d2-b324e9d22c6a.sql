-- Ajouter le rôle admin à l'utilisateur debbarhabdelaziz@gmail.com
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Récupérer l'user_id depuis l'email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'debbarhabdelaziz@gmail.com';
  
  -- Vérifier si l'utilisateur existe
  IF v_user_id IS NOT NULL THEN
    -- Ajouter le rôle admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Rôle admin ajouté à debbarhabdelaziz@gmail.com';
  ELSE
    RAISE NOTICE 'Utilisateur debbarhabdelaziz@gmail.com non trouvé. Créez d''abord un compte avec cet email.';
  END IF;
END $$;