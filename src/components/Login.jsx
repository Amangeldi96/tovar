import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import './css/Login.css';

const Login = ({ onLoginSuccess, onBack }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // ================= LOGIN =================
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

  // ================= RESET =================
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
              <i className="fa-solid fa-arrow-left"></i>
              <span>Башкы бет</span>
            </div>

            <h1>Кирүү</h1>

            {error && !showForgot && (
              <p className="status-msg error">{error}</p>
            )}

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

              <button type="submit" className="action-btn">
                Кирүү
              </button>
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
              <i className="fa-solid fa-arrow-left"></i>
              <span>Артка</span>
            </div>

            <h1>Калыбына келтирүү</h1>

            <p style={{ color: '#6c757d', marginBottom: '30px', fontSize: '14px' }}>
              Электрондук почтаңызды жазыңыз, биз сизге шилтеме жөнөтөбүз.
            </p>

            {error && showForgot && (
              <p className="status-msg error">{error}</p>
            )}

            {message && (
              <p className="status-msg success">{message}</p>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <i className="fa-regular fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Email почта"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="action-btn">
                Шилтеме жөнөтүү
              </button>
            </form>

          </div>

        </div>

        {/* WELCOME SIDE */}
        <div className="welcome-side">
          <h2>КОШ КЕЛИҢИЗ!</h2>
          <p>Системаны колдонуу үчүн жеке аккаунтуңузга кириңиз.</p>
        </div>

      </div>
    </div>
  );
};

export default Login;