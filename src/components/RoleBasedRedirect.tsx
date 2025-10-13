import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, isPoliceRole, isAdmin, isNDAAAdmin, isRegistrar, isVerifier, isFieldAgent, isCarAdmin, isNARAuthority } = useUserRole();

  useEffect(() => {
    if (!user || loading) return;

    // Redirect based on role hierarchy
    if (isAdmin || isNDAAAdmin) {
      navigate('/dashboard'); // Admin users go to main dashboard
    } else if (isPoliceRole) {
      navigate('/police');
    } else if (isNARAuthority) {
      navigate('/dashboard'); // NAR authorities go to dashboard (will see NAR-specific view)
    } else if (isRegistrar) {
      navigate('/dashboard'); // Registrar users go to main dashboard
    } else if (isVerifier) {
      navigate('/dashboard'); // Verifier users go to main dashboard
    } else if (isFieldAgent) {
      navigate('/dashboard'); // Field agent users go to main dashboard
    } else if (isCarAdmin) {
      navigate('/dashboard'); // CAR users go to main dashboard with CAR interface
    } else {
      navigate('/dashboard');
    }
  }, [user, loading, isPoliceRole, isAdmin, isNDAAAdmin, isRegistrar, isVerifier, isFieldAgent, isCarAdmin, isNARAuthority, navigate]);

  return null;
};

export default RoleBasedRedirect;