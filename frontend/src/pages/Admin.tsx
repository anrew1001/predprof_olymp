import { useState } from 'react';
import { createUser } from '../api/client';
import type { UserOut } from '../types/api';
import Navbar from '../components/Navbar';
import axios from 'axios';

interface FormState {
  first_name: string;
  last_name: string;
  login: string;
  password: string;
  role: 'admin' | 'user';
}

const initialForm: FormState = {
  first_name: '',
  last_name: '',
  login: '',
  password: '',
  role: 'user',
};

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function Admin() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [createdUsers, setCreatedUsers] = useState<UserOut[]>([]);

  const showToast = (type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await createUser(form);
      setCreatedUsers(prev => [...prev, user]);
      showToast('success', `Пользователь "${user.login}" создан`);
      setForm(initialForm);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.detail ?? 'Ошибка создания пользователя';
        showToast('error', msg);
      } else {
        showToast('error', 'Ошибка соединения');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-surface)' }}>
      <Navbar />

      <main style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Page header */}
        <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Панель администратора
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Управление пользователями системы
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Create User Form */}
          <div className="card animate-fade-up" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
              Создать пользователя
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Имя
                  </label>
                  <input className="input-field" type="text" value={form.first_name}
                    onChange={handleChange('first_name')} placeholder="Иван" required />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                    Фамилия
                  </label>
                  <input className="input-field" type="text" value={form.last_name}
                    onChange={handleChange('last_name')} placeholder="Иванов" required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Логин
                </label>
                <input className="input-field" type="text" value={form.login}
                  onChange={handleChange('login')} placeholder="ivanov_ivan" required />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Пароль
                </label>
                <input className="input-field" type="password" value={form.password}
                  onChange={handleChange('password')} placeholder="••••••••" required />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>
                  Роль
                </label>
                <select className="input-field" value={form.role} onChange={handleChange('role')}
                  style={{ cursor: 'pointer' }}>
                  <option value="user">Пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>

              {toast && (
                <div style={{
                  background: toast.type === 'success' ? 'var(--success-light)' : 'var(--error-light)',
                  border: `1px solid ${toast.type === 'success' ? 'var(--success-border)' : 'var(--error-border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: toast.type === 'success' ? 'var(--success)' : 'var(--error)',
                }}>
                  {toast.message}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ marginTop: '4px', justifyContent: 'center' }}>
                {loading ? <><span className="spinner" />Создание...</> : 'Создать пользователя'}
              </button>
            </form>
          </div>

          {/* Users list */}
          <div className="animate-fade-up-delay-1">
            <div style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '12px',
            }}>
              Создано в этой сессии ({createdUsers.length})
            </div>

            {createdUsers.length === 0 ? (
              <div className="card" style={{
                padding: '32px',
                textAlign: 'center',
                borderStyle: 'dashed',
                background: 'var(--bg-surface)',
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Нет созданных пользователей
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {createdUsers.map((u, i) => (
                  <div key={i} className="card" style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {u.first_name} {u.last_name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '1px' }}>
                        @{u.login}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: u.role === 'admin' ? 'var(--bg-surface)' : 'var(--blue-light)',
                      color: u.role === 'admin' ? 'var(--text-secondary)' : 'var(--blue)',
                      border: `1px solid ${u.role === 'admin' ? 'var(--border)' : 'rgba(37,99,235,0.2)'}`,
                    }}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
