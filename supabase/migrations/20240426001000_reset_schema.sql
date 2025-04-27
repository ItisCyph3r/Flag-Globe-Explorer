DO $$ 
BEGIN
    -- Drop existing tables and their dependencies
    DROP TABLE IF EXISTS public.profiles CASCADE;
    DROP TABLE IF EXISTS public.email_templates CASCADE;
    
    -- Clear any lingering prepared statements
    DEALLOCATE ALL;
END $$;

-- Create email_templates table
CREATE TABLE public.email_templates (
    id SERIAL PRIMARY KEY,
    template_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    variables JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'draft', 'archived')),
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    given_name TEXT,
    family_name TEXT,
    locale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    email_notifications_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    last_reminder_sent TIMESTAMP WITH TIME ZONE,
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX email_templates_status_idx ON public.email_templates(status);
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_last_login_idx ON public.profiles(last_login);