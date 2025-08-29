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

    // Redirect based on role hierarchy
    if (isAdmin || isNDAAAdmin) {
      navigate('/admin');
    } else if (isPoliceRole) {
      navigate('/police');
    } else if (isRegistrar) {
      navigate('/registrar');
    } else if (isVerifier) {
      navigate('/verifier');
    } else if (isFieldAgent) {
      navigate('/field-agent');
    } else {
      navigate('/dashboard');
    }
  }, [user, loading, isPoliceRole, isAdmin, isNDAAAdmin, isRegistrar, isVerifier, isFieldAgent, navigate]);

  return null;
};

export default RoleBasedRedirect;