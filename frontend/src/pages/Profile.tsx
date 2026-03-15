import { getAuthStore } from '../api/client';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { first_name, last_name, login, role } = getAuthStore();
  const initials = `${first_name[0] ?? '?'}${last_name[0] ?? ''}`.toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-surface)' }}>
      <Navbar />

      <main style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="card animate-fade-up" style={{ padding: '32px' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '20px',
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {first_name} {last_name}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  @{login}
                </div>
              </div>
            </div>

            {/* Role badge */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 500,
                padding: '3px 10px',
                borderRadius: '20px',
                background: role === 'admin' ? 'var(--bg-surface)' : 'var(--blue-light)',
                color: role === 'admin' ? 'var(--text-secondary)' : 'var(--blue)',
                border: `1px solid ${role === 'admin' ? 'var(--border)' : 'rgba(37,99,235,0.2)'}`,
              }}>
                {role === 'admin' ? 'Администратор' : 'Пользователь'}
              </span>
            </div>

            {/* Info table */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              marginBottom: '24px',
            }}>
              {[
                { label: 'Имя', value: first_name },
                { label: 'Фамилия', value: last_name },
                { label: 'Логин', value: login },
                { label: 'Роль', value: role === 'admin' ? 'Администратор' : 'Пользователь' },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>

            <Link
              to={role === 'admin' ? '/admin' : '/dashboard'}
              style={{ fontSize: '14px', color: 'var(--blue)', textDecoration: 'none' }}
            >
              ← Назад
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
