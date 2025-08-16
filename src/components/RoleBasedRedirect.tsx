import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role, loading } = useUserRole();

  useEffect(() => {
    if (!user || loading) return;

    // Redirect based on user role
    switch (role) {
      case 'admin':
      case 'ndaa_admin':
        navigate('/admin');
        break;
      case 'registrar':
        navigate('/registrar');
        break;
      case 'verifier':
        navigate('/verifier');
        break;
      case 'field_agent':
        navigate('/field-agent');
        break;
      case 'citizen':
      case 'property_claimant':
        navigate('/citizen');
        break;
      case 'moderator':
      case 'user':
      case 'partner':
      case 'auditor':
      case 'data_steward':
      case 'support':
      default:
        navigate('/citizen'); // Default to citizen dashboard
        break;
    }
  }, [user, role, loading, navigate]);

  return null;
};