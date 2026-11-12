CREATE TABLE IF NOT EXISTS public.offline_package_downloads (
    visitor_id uuid NOT NULL,
    language text NOT NULL CHECK (language IN ('vi', 'en')),
    first_downloaded_at timestamptz NOT NULL DEFAULT now(),
    last_downloaded_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (visitor_id, language)
);