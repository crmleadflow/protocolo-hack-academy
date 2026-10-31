-- Add sort_order column to programs table
ALTER TABLE public.programs 
ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Set initial sort order based on creation date
WITH ordered_programs AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.programs
)
UPDATE public.programs p
SET sort_order = op.rn
FROM ordered_programs op
WHERE p.id = op.id;