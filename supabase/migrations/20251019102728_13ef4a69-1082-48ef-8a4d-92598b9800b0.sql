-- Créer une table pour les transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id),
  offer_id UUID REFERENCES public.driver_offers(id),
  client_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_type TEXT NOT NULL DEFAULT 'service',
  description TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own transactions as client"
ON public.transactions
FOR SELECT
USING (auth.uid() = client_id);

CREATE POLICY "Users can view their own transactions as driver"
ON public.transactions
FOR SELECT
USING (auth.uid() = driver_id);

CREATE POLICY "Clients can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions
FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = driver_id);

-- Index
CREATE INDEX idx_transactions_client_id ON public.transactions(client_id);
CREATE INDEX idx_transactions_driver_id ON public.transactions(driver_id);
CREATE INDEX idx_transactions_status ON public.transactions(payment_status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Créer une table pour le portefeuille des chauffeurs
CREATE TABLE IF NOT EXISTS public.driver_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL UNIQUE,
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  pending_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC(10, 2) NOT NULL DEFAULT 0,
  last_payout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.driver_wallets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Drivers can view their own wallet"
ON public.driver_wallets
FOR SELECT
USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can create their own wallet"
ON public.driver_wallets
FOR INSERT
WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "System can update wallets"
ON public.driver_wallets
FOR UPDATE
USING (true);

-- Index
CREATE INDEX idx_driver_wallets_driver_id ON public.driver_wallets(driver_id);

-- Trigger for updated_at
CREATE TRIGGER update_driver_wallets_updated_at
BEFORE UPDATE ON public.driver_wallets
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_wallets;