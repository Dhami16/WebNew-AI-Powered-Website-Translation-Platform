-- V3.0: which translation provider a site uses. Defaults every existing row
-- (including CLI-created sites) to the provider they've always used, so
-- nothing changes unless someone explicitly switches it.
ALTER TABLE public.sites ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'mymemory';
