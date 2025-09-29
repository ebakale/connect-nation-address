-- Habilitar RLS para la nueva tabla de contadores UAC
ALTER TABLE public.uac_sequence_counters ENABLE ROW LEVEL SECURITY;

-- Política para permitir que solo admins/registradores gestionen contadores
CREATE POLICY "Admins can manage UAC sequence counters" ON public.uac_sequence_counters
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role)
);

-- Política para permitir que funciones del sistema actualicen contadores
CREATE POLICY "System functions can use UAC sequence counters" ON public.uac_sequence_counters
FOR ALL TO authenticated USING (true);