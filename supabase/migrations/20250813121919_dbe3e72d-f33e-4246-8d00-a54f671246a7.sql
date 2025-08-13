-- Fix: Allow users to insert their own roles (needed for self-admin assignment)
CREATE POLICY "Users can create their own role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own roles (in case they want to change from user to admin)
CREATE POLICY "Users can update their own role" 
ON public.user_roles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);