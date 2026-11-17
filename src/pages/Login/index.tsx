import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import styles from './Login.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { authenticate } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authenticate(locations.login, { email, password });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <header className={styles.header}>
          <span className={styles.badge}>
            <LocalFireDepartmentIcon fontSize="small" aria-hidden="true" />
            CHURRASCARIA &amp; COMANDA
          </span>
          <h1 id="login-title" className={styles.title}>Cardápio Digital</h1>
          <p className={styles.subtitle}>Painel de mesas e pedidos</p>
        </header>

        <form className={styles.form} onSubmit={handleLogin}>
          {error && (
            <div className={styles.alert} role="alert">
              <ErrorOutlineIcon aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="login-email" className={styles.label}>E-mail</label>
            <div className={styles.inputWrap}>
              <EmailOutlinedIcon aria-hidden="true" />
              <input
                id="login-email"
                className={styles.input}
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atendente@churrascaria.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="login-password" className={styles.label}>Senha de acesso</label>
            <div className={styles.inputWrap}>
              <LockOutlinedIcon aria-hidden="true" />
              <input
                id="login-password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Entrando...
              </>
            ) : (
              'Abrir sistema'
            )}
          </button>
        </form>

        <footer className={styles.footer}>
          <span>Versão PWA 2.0</span>
          <span>
            <LockOutlinedIcon sx={{ fontSize: 14 }} aria-hidden="true" />
            Terminal seguro
          </span>
        </footer>
      </section>
    </main>
  );
}
