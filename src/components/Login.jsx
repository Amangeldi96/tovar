import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
// Ишенимдүү иконкаларды импорттоп алабыз
import { FaArrowLeft, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import './css/Login.css';

const Login = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
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
      setError("Логин же сырсөз туура эмес!");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError("Email жазыңыз!");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Шилтеме почтаңызга жөнөтүлдү.");
    } catch (err) {
      setError("Email табылган жок же туура эмес!");
    }
  };

  return (
    <div className="auth-wrapper-wrapper">
      <div className={`auth-wrapper ${showForgot ? 'show-forgot' : ''}`}>
        <div className="form-container">
          
          {/* LOGIN SIDE */}
          <div className="login-side">
            <div className="back-nav" onClick={onBack}>
              <FaArrowLeft /> {/* Иконка алмашты */}
              <span>Башкы бет</span>
            </div>

            <h1>Кирүү</h1>
            {error && !showForgot && (
              <p className="status-msg error">{error}</p>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <FaUser className="input-icon-fixed" /> {/* Иконка алмашты */}
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <FaLock className="input-icon-fixed" /> {/* Иконка алмашты */}
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

            <button
              className="forgot-trigger-btn"
              onClick={() => {
                setShowForgot(true);
                setError('');
                setMessage('');
              }}
            >
              Паролду унутуп калдыңызбы?
            </button>
          </div>

          {/* FORGOT SIDE */}
          <div className="forgot-side">
            <div
              className="back-nav"
              onClick={() => {
                setShowForgot(false);
                setError('');
                setMessage('');
              }}
            >
              <FaArrowLeft /> {/* Иконка алмашты */}
              <span>Артка</span>
            </div>

            <h1>Калыбына келтирүү</h1>
            <p style={{ color: '#6c757d', marginBottom: '30px', fontSize: '14px' }}>
              Электрондук почтаңызды жазыңыз, биз сизге шилтеме жөнөтөбүз.
            </p>

            {error && showForgot && <p className="status-msg error">{error}</p>}
            {message && <p className="status-msg success">{message}</p>}

            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <FaEnvelope className="input-icon-fixed" /> {/* Иконка алмашты */}
                <input
                  type="email"
                  placeholder="Email почта"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="action-btn">Шилтеме жөнөтүү</button>
            </form>
          </div>
        </div>

        <div className="welcome-side">
          <h2>КОШ КЕЛИҢИЗ!</h2>
          <p>Системаны колдонуу үчүн жеке аккаунтуңузга кириңиз.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;