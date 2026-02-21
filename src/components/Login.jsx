import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './Login.css'; // Сиз берген CSS ушул файлда болушу керек

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgot, setIsForgot] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Кирүү (Login) функциясы
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError("Логин же пароль ката!");
    }
  };

  // Паролду калыбына келтирүү функциясы
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Шилтеме почтаңызга жөнөтүлдү.");
    } catch (err) {
      setError("Email табылган жок!");
    }
  };

  return (
    /* Сиз берген auth-wrapper структурасы */
    <div className={`auth-wrapper ${isForgot ? 'show-forgot' : ''}`} id="authWrapper">
      <div className="form-container">
        
        {/* КИРҮҮ ТАРАБЫ (Login Side) */}
        <div className="login-side">
          {/* Артка баскычы сиздин дизайндагыдай */}
          <div className="back-nav" onClick={() => window.location.reload()}>
            <i className="fa-solid fa-arrow-left"></i>
            <span>Артка</span>
          </div>
          
          <h1>Кирүү</h1>
          
          {error && !isForgot && <p style={{color: '#ff4d4d', fontSize: '13px', marginBottom: '10px'}}>{error}</p>}

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

        {/* ПАРОЛДУ УНУТТУМ ТАРАБЫ (Forgot Side) */}
        <div className="forgot-side">
          <div className="back-nav" onClick={() => setIsForgot(false)}>
            <i className="fa-solid fa-arrow-left"></i>
            <span>Артка</span>
          </div>
          
          <h1>Reset</h1>
          <p style={{ color: '#888', marginBottom: '30px', fontSize: '14px' }}>
            Электрондук почтаңызды жазыңыз, биз сизге шилтеме жөнөтөбүз.
          </p>

          {error && isForgot && <p style={{color: '#ff4d4d', fontSize: '13px'}}>{error}</p>}
          {message && <p style={{color: '#2ecc71', fontSize: '13px'}}>{message}</p>}
          
          <form onSubmit={handleReset}>
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

      {/* ОҢ ТАРАПТАГЫ WELCOME SIDE */}
      <div className="welcome-side">
        <h2>КОШ КЕЛИҢИЗ!</h2>
        <p>Системаны колдонуу үчүн кирүүңүз керек.</p>
      </div>
    </div>
  );
};

export default Login;