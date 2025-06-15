
-- Create alert_preferences table for user notification settings
CREATE TABLE public.alert_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  profit_margin_threshold DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  min_stock INTEGER NOT NULL DEFAULT 1,
  include_retailers TEXT[] NOT NULL DEFAULT ARRAY['Amazon', 'Barnes & Noble', 'ThriftBooks'],
  alert_frequency VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (alert_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to ensure one preference per user
ALTER TABLE public.alert_preferences ADD CONSTRAINT unique_user_alert_preference UNIQUE (user_id);

-- Enable Row Level Security
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for alert preferences
CREATE POLICY "Users can view their own alert preferences" 
  ON public.alert_preferences 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own alert preferences" 
  ON public.alert_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own alert preferences" 
  ON public.alert_preferences 
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own alert preferences" 
  ON public.alert_preferences 
  FOR DELETE 
  USING (auth.uid()::text = user_id::text);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_alert_preferences_updated_at
    BEFORE UPDATE ON public.alert_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
