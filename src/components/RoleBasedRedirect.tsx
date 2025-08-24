import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, hasPoliceAccess } = useUserRole();

  useEffect(() => {
    if (!user || loading) return;

    // All authenticated users go to unified dashboard
    navigate(hasPoliceAccess ? '/police' : '/dashboard');
  }, [user, loading, hasPoliceAccess, navigate]);

  return null;
};