
-- 1. Profiles table to store Stripe customer mapping
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Subscriptions table to track active plans
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY, -- Stripe Subscription ID
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL, -- Stripe Price ID
  status TEXT NOT NULL, -- active, canceled, incomplete, etc.
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Invoices table for billing history
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY, -- Stripe Invoice ID
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_total INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL, -- paid, open, void
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);

-- 4. Trigger to create a profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Helper for the existing users (if any)
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
