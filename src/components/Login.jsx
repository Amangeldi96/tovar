import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './css/Login.css';

const Login = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgot, setIsForgot] = useState(false); // Анимация үчүн класс алмаштырат
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Кирүү функциясы
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

  // Паролду калыбына келтирүү
  const handleResetPassword = async (e) => {
    e.preventDefault();
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
    <div className="auth-body">
      <div className={`auth-wrapper ${isForgot ? 'show-forgot' : ''}`}>
        
        <div className="form-container">
          
          {/* КИРҮҮ ТАРАПЫ */}
          <div className="login-side">
            <div className="back-nav" onClick={onBack}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Артка</span>
            </div>
            <h1>Кирүү</h1>
            
            {error && !isForgot && <p className="status-msg error">{error}</p>}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <i className="fa-regular fa-user"></i>
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <i className="fa-solid fa-lock"></i>
                <input 
                  type="password" 
                  placeholder="Сырсөз" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="action-btn">Кирүү</button>
            </form>

            <button className="forgot-trigger-btn" onClick={() => setIsForgot(true)}>
              Паролду унутуп калдыңызбы?
            </button>
          </div>

          {/* ПАРОЛДУ УНУТТУМ ТАРАПЫ */}
          <div className="forgot-side">
            <div className="back-nav" onClick={() => setIsForgot(false)}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>Артка</span>
            </div>
            <h1>Reset</h1>
            <p className="reset-hint">Электрондук почтаңызды жазыңыз, биз сизге шилтеме жөнөтөбүз.</p>
            
            {error && isForgot && <p className="status-msg error">{error}</p>}
            {message && <p className="status-msg success">{message}</p>}

            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <i className="fa-regular fa-envelope"></i>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="action-btn">Шилтеме жөнөтүү</button>
            </form>
          </div>

        </div>

        {/* ОҢ ЖАГЫ (WELCOME) */}
        <div className="welcome-side">
          <h2>КОШ КЕЛИҢИЗ!</h2>
          <p>Системаны колдонуу үчүн кирүүңүз керек.</p>
        </div>

      </div>
    </div>
  );
};

export default Login;