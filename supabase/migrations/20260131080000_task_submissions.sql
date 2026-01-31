-- Create task_submissions table for manual approval of tasks (e.g., tweet submissions)
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  submission_link text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE(user_id, task_id)
);

-- Enable RLS
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
  ON public.task_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create submissions
CREATE POLICY "Users can create submissions"
  ON public.task_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
  ON public.task_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update submissions
CREATE POLICY "Admins can update submissions"
  ON public.task_submissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add index for faster queries
CREATE INDEX idx_task_submissions_status ON public.task_submissions(status);
CREATE INDEX idx_task_submissions_user_id ON public.task_submissions(user_id);
