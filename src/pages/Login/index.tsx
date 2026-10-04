import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import styles from './Login.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { authenticate } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      // Chama o contexto usando a localização da API criada
      await authenticate(locations.login, { email, password });
      
      // Se for sucesso, redireciona pra home (ou dashboard)
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('E-mail ou senha incorretos.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleLogin} className={styles.loginBox}>
        <h2>Acesso ao Painel</h2>
        
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.inputGroup}>
          <label htmlFor="email">E-mail</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Digite seu e-mail"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Digite sua senha"
          />
        </div>

        <button type="submit" className={styles.loginButton}>Entrar</button>
      </form>
    </div>
  );
}
