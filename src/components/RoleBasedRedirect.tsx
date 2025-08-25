import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, isPoliceRole } = useUserRole();

  useEffect(() => {
    if (!user || loading) return;

    // Redirect based on role
    navigate(isPoliceRole ? '/police' : '/dashboard');
  }, [user, loading, isPoliceRole, navigate]);

  return null;
};

export default RoleBasedRedirect;