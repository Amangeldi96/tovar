import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const Login = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Глазок үчүн абал
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
      setError("Паролду калыбына келтирүү үчүн адегенде Email жазыңыз!");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Паролду өзгөртүү шилтемеси Email почтаңызга жөнөтүлдү.");
      setError('');
    } catch (err) {
      setError("Ката кетти. Email туура экенин текшериңиз.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Админ Панель</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
        {message && <p style={{ color: 'green', textAlign: 'center', fontSize: '14px' }}>{message}</p>}
        
        <input 
          type="email" placeholder="Email" value={email} 
          onChange={(e) => setEmail(e.target.value)} style={styles.input} required 
        />
        
        <div style={styles.passwordContainer}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Пароль" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={styles.passwordInput} required 
          />
          <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? (
              /* Көзү ачык SVG */
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 14C3 9.02944 7.02944 5 12 5C16.9706 5 21 9.02944 21 14M17 14C17 16.7614 14.7614 19 12 19C9.23858 19 7 16.7614 7 14C7 11.2386 9.23858 9 12 9C14.7614 9 17 11.2386 17 14Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              /* Көзү жабык SVG */
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.60997 9.60714C8.05503 10.4549 7 12.1043 7 14C7 16.7614 9.23858 19 12 19C13.8966 19 15.5466 17.944 16.3941 16.3878M21 14C21 9.02944 16.9706 5 12 5C11.5582 5 11.1238 5.03184 10.699 5.09334M3 14C3 11.0069 4.46104 8.35513 6.70883 6.71886M3 3L21 21" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
        </div>
        
        <button type="submit" style={styles.button}>КИРҮҮ</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
          <p onClick={handleResetPassword} style={styles.resetLink}>Паролду унутум?</p>
          <p onClick={onBack} style={styles.resetLink}>← Артка</p>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 },
  form: { background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '320px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  passwordContainer: { position: 'relative', width: '100%', marginBottom: '15px' },
  passwordInput: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  eyeIcon: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.6, display: 'flex', alignItems: 'center' },
  button: { width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  resetLink: { color: '#666', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }
};

export default Login;