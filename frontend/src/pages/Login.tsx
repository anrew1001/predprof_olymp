import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, saveAuth } from '../api/client';
import type { UserOut } from '../types/api';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tokenData = await login(username, password);
      const payload = JSON.parse(atob(tokenData.access_token.split('.')[1]));
      const user: UserOut = {
        id: 0,
        first_name: payload.first_name ?? username,
        last_name: payload.last_name ?? '',
        login: payload.sub ?? username,
        role: payload.role ?? 'user',
      };
      saveAuth(tokenData.access_token, user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Неверный логин или пароль');
      } else {
        setError('Ошибка соединения с сервером');
      }
    } finally {
      setLoading(false);
    }
  }, [username, password, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-surface)',
    }}>
      <div className="card animate-fade-up" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px 36px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📡</div>
          <h1 style={{
            fontFamily: 'var(--font)',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 4px',
          }}>
            Alien Signal Classifier
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
          }}>
            Войдите в систему
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="animate-fade-up-delay-1">
            <label style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '5px',
            }}>
              Логин
            </label>
            <input
              className="input-field"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="animate-fade-up-delay-2">
            <label style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '5px',
            }}>
              Пароль
            </label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--error-light)',
              border: '1px solid var(--error-border)',
              borderRadius: 'var(--radius)',
              padding: '10px 12px',
              fontSize: '13px',
              color: 'var(--error)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary animate-fade-up-delay-3"
            disabled={loading}
            style={{ marginTop: '4px', width: '100%', justifyContent: 'center' }}
          >
            {loading ? <><span className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />Вход...</> : 'Войти'}
          </button>
        </form>

        <p className="animate-fade-up-delay-4" style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          МПОШ · Продуктовый сектор · ИТ
        </p>
      </div>
    </div>
  );
}
