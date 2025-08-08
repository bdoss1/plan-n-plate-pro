-- Create profiles table for user data and dietary preferences
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  
  -- Dietary preferences and restrictions
  dietary_preferences TEXT[], -- e.g., ['plant-based', 'keto', 'gluten-free']
  allergies TEXT[], -- e.g., ['nuts', 'dairy', 'shellfish']
  budget_range TEXT, -- e.g., 'low', 'medium', 'high'
  cooking_skill_level TEXT, -- e.g., 'beginner', 'intermediate', 'advanced'
  meals_per_week INTEGER DEFAULT 7,
  household_size INTEGER DEFAULT 1,
  
  -- Subscription and usage tracking
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'premium'
  monthly_meal_plans_used INTEGER DEFAULT 0,
  monthly_smart_suggests_used INTEGER DEFAULT 0,
  custom_recipes_count INTEGER DEFAULT 0,
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create recipes table for user-created recipes
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  servings INTEGER DEFAULT 4,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  ingredients JSONB NOT NULL, -- [{"name": "chicken", "quantity": 1, "unit": "lb"}]
  instructions TEXT[] NOT NULL, -- ["Step 1", "Step 2", ...]
  image_url TEXT,
  source_url TEXT, -- If imported from URL
  tags TEXT[], -- ['dinner', 'easy', 'chicken']
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plans table for AI-generated meal plans
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  meals JSONB NOT NULL, -- {"monday": {"breakfast": {...}, "lunch": {...}, "dinner": {...}}}
  grocery_list JSONB, -- Auto-generated grocery list
  total_estimated_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_clicks table for tracking
CREATE TABLE public.affiliate_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_name TEXT NOT NULL, -- 'instacart', 'walmart', 'amazon_fresh'
  order_url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'clicked' -- 'clicked', 'converted', 'pending'
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for recipes
CREATE POLICY "Users can view their own recipes" 
ON public.recipes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes" 
ON public.recipes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" 
ON public.recipes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" 
ON public.recipes 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their own meal plans" 
ON public.meal_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans" 
ON public.meal_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" 
ON public.meal_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" 
ON public.meal_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for affiliate_clicks (users can view their own, admins can view all)
CREATE POLICY "Users can view their own affiliate clicks" 
ON public.affiliate_clicks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create affiliate clicks" 
ON public.affiliate_clicks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();