import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './css/Login.css'; // Стилдерди өзүнчө файлга сактаңыз

const Login = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError("Логин же пароль ката!");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Email жазыңыз!");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Шилтеме почтаңызга жөнөтүлдү.");
      setError('');
    } catch (err) {
      setError("Email туура эмес!");
    }
  };

  return (
    <div className="login-full-screen">
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      
      <form className="glass-form" onSubmit={handleLogin}>
        <h3>Админ Панель</h3>

        {error && <p className="status-msg error">{error}</p>}
        {message && <p className="status-msg success">{message}</p>}

        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          placeholder="Электрондук почта" 
          id="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />

        <label htmlFor="password">Пароль</label>
        <div className="password-wrapper">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Пароль" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            )}
          </span>
        </div>

        <button type="submit" className="login-submit">КИРҮҮ</button>

        <div className="form-links">
          <div className="link-item" onClick={handleResetPassword}>Унутуп калдым?</div>
          <div className="link-item" onClick={onBack}>← Артка</div>
        </div>
      </form>
    </div>
  );
};

export default Login;