ALTER TABLE public.targets ADD COLUMN done_on date;
UPDATE public.targets SET done_on = (now() AT TIME ZONE 'utc')::date WHERE done;