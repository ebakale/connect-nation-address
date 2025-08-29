import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, isPoliceRole, isAdmin, isNDAAAdmin, isRegistrar, isVerifier, isFieldAgent } = useUserRole();

  useEffect(() => {
    if (!user || loading) return;

    // All roles now use the unified dashboard
    navigate('/dashboard');
  }, [user, loading, navigate]);

  return null;
};

export default RoleBasedRedirect;