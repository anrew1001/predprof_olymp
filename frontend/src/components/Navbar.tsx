import { useNavigate, Link } from 'react-router-dom';
import { clearAuth, getAuthStore } from '../api/client';

interface NavbarProps {
  showProfile?: boolean;
}

export default function Navbar({ showProfile = true }: NavbarProps) {
  const navigate = useNavigate();
  const { first_name, last_name, role } = getAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--bg)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '18px' }}>📡</span>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--blue)' }}>Alien</span> Classifier
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {showProfile && (
          <Link
            to="/profile"
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
          >
            {first_name} {last_name}
          </Link>
        )}

        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: '20px',
          background: role === 'admin' ? 'var(--bg-surface)' : 'var(--blue-light)',
          color: role === 'admin' ? 'var(--text-secondary)' : 'var(--blue)',
          border: `1px solid ${role === 'admin' ? 'var(--border)' : 'rgba(37,99,235,0.2)'}`,
        }}>
          {role}
        </span>

        <button className="btn-ghost" onClick={handleLogout}>
          Выход
        </button>
      </div>
    </nav>
  );
}
