import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import './css/admin.css';

const styles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' },
  modalContent: { background: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', width: '320px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', background: '#f5f5f5', fontWeight: 'bold' },
  confirmBtn: { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#dc3545', color: 'white', fontWeight: 'bold' },
  
  // ЖАҢЫ: Уведомлениелер үчүн контейнер жана стилдер
  notificationContainer: {
    position: 'fixed', top: '20px', right: '20px', zIndex: 10005, display: 'flex', flexDirection: 'column', gap: '10px'
  },
  toast: {
    padding: '14px 24px', borderRadius: '12px', color: 'white', fontWeight: '600', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)', minWidth: '280px', display: 'flex', 
    alignItems: 'center', gap: '12px', animation: 'slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },

  suggestionBox: {
    position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white',
    borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', zIndex: 100,
    maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', marginTop: '5px'
  },
  suggestionItem: {
    padding: '10px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', textAlign: 'left', fontSize: '13px'
  }
};

const AdminPanel = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // ЖАҢЫ: Уведомлениелердин тизмесин сактоочу state
  const [notifications, setNotifications] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [formData, setFormData] = useState({
    mainCategory: 'Тандаңыз...',
    subCategory: '',
    name: '',
    price: '',
    unit: 'кг'
  });

  // ЖАҢЫ: Уведомление чыгаруучу жардамчы функция
  const notify = (msg, type = 'success') => {
    const id = Date.now();
    const config = {
      success: { bg: '#2ecc71', icon: '✅' },
      error: { bg: '#e74c3c', icon: '🚫' },
      info: { bg: '#3498db', icon: '🗑️' }
    };
    
    const { bg, icon } = config[type] || config.success;
    setNotifications(prev => [...prev, { id, msg, bg, icon }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, "all_products"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { setUser(currentUser); fetchProducts(); } 
      else { setUser(null); }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, name: val });
    if (val.length > 0) {
      const filtered = products.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
      setFormData(prev => ({ ...prev, subCategory: '' }));
    }
  };

  const selectSuggestion = (p) => {
    setFormData({ ...formData, name: p.name, mainCategory: p.mainCategory, subCategory: p.subCategory, unit: p.unit });
    setSuggestions([]);
    notify(`Бул товар базада бар!`, 'error');
  };

  const checkDuplicateWithAI = async (newName) => {
    const existingList = products.map(p => p.name).join(", ");
    if (!existingList) return "UNIQUE";
    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `Сен базадагы товарларды кайталануудан коргоочу жардамчысың. Эгер жаңы товар базада бар товардын синоними болсо же мааниси 100% бирдей болсо, ГАНА "DUPLICATE" деп жооп бер. Жооп 1 сөз: DUPLICATE же UNIQUE.` },
            { role: "user", content: `Базада: [${existingList}]. Жаңы товар: "${newName}"` }
          ],
          temperature: 0
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "UNIQUE";
    } catch (err) { return "UNIQUE"; }
  };

  const detectSubCategory = async (productName) => {
    if (!productName || productName.length < 2 || formData.mainCategory === 'Тандаңыз...') return;
    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Товардын атына карап, анын ички категориясын ГАНА 1 сөз менен аныкта." },
            { role: "user", content: `Категория: ${formData.mainCategory}. Товар: "${productName}"` }
          ],
          temperature: 0.1
        })
      });
      if (response.ok) {
        const data = await response.json();
        const detected = data.choices[0].message.content.trim().replace(/[.]/g, "");
        setFormData(prev => ({ ...prev, subCategory: detected }));
      }
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    const isExactDuplicate = products.some(p => p.name.toLowerCase() === formData.name.toLowerCase() && p.mainCategory === formData.mainCategory);
    
    if (isExactDuplicate) {
      notify(`"${formData.name}" базада мурунтан бар!`, 'error');
      return;
    }

    if (!formData.name || !formData.price || formData.mainCategory === 'Тандаңыз...') {
      return notify("Маалыматты толук киргизиңиз!", 'error');
    }

    setLoading(true);
    const aiDecision = await checkDuplicateWithAI(formData.name);

    if (aiDecision === "DUPLICATE") {
      notify(`AI: "${formData.name}" окшошу табылды!`, 'error');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "all_products"), { 
        ...formData, 
        price: Number(formData.price), 
        timestamp: serverTimestamp() 
      });
      notify("Товар ийгиликтүү кошулду!");
      await fetchProducts();
      setFormData({ ...formData, name: '', price: '', subCategory: '' }); 
    } catch (e) {
      notify("Серверде ката чыкты!", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, "all_products", productToDelete.id));
        notify(`"${productToDelete.name}" өчүрүлдү`, 'info');
        await fetchProducts();
        setShowConfirm(false);
        setProductToDelete(null);
      } catch (e) { notify("Өчүрүүдө ката чыкты", 'error'); }
    }
  };

  const confirmDelete = (product) => { setProductToDelete(product); setShowConfirm(true); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { setLoginError("Логин же пароль ката!"); }
  };

  const handleExit = async () => {
    try { await signOut(auth); setUser(null); onBack(); } catch (e) { onBack(); }
  };

  if (authLoading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Жүктөлүүдө...</div>;

  if (!user) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Админ Панель</h2>
          {loginError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{loginError}</p>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} required />
          <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }} required />
          <button type="submit" style={{ width: '100%', padding: '14px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>КИРҮҮ</button>
          <p onClick={onBack} style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#666', textDecoration: 'underline' }}>Башкы бетке кайтуу</p>
        </form>
      </div>
    );
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="admin-container">
      
      {/* ЖАҢЫ: УВЕДОМЛЕНИЕ КОНТЕЙНЕР (Баардык билдирүүлөр ушул жерде тизилет) */}
      <div style={styles.notificationContainer}>
        {notifications.map(n => (
          <div key={n.id} style={{...styles.toast, background: n.bg}}>
            <span>{n.icon}</span> {n.msg}
          </div>
        ))}
      </div>

      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{fontSize: '40px', marginBottom: '10px'}}>⚠️</div>
            <h3 style={{color: '#333', marginBottom: '10px'}}>Чын эле өчүрөсүзбү?</h3>
            <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>
              "<strong>{productToDelete?.name}</strong>" өчүрүлсүнбү?
            </p>
            <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => setShowConfirm(false)} style={styles.cancelBtn}>Жок</button>
              <button onClick={handleDelete} style={styles.confirmBtn}>Ооба, өчүрүлсүн</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-header-row">
        <button className="btn-back-minimal" onClick={handleExit}>← Артка</button>
        <div className="search-wrapper">
          <input type="text" placeholder="Товарларды издөө..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="horizontal-form-card">
        <div className="form-inner-row">
          <div className="form-item custom-dropdown-container">
            <div className={`custom-dropdown-trigger ${catOpen ? 'is-open' : ''}`} onClick={() => setCatOpen(!catOpen)}>
              <span className="selected-value">{formData.mainCategory}</span>
              <span className="arrow-icon"></span>
            </div>
            {catOpen && (
              <div className="custom-dropdown-menu">
                {['Строй материал', 'Хоз товар', 'Сантехника', 'Электроника', 'ПВХ жана Алюминий', 'Автозапчасти'].map(item => (
                  <div key={item} className="dropdown-option" onClick={() => { setFormData({...formData, mainCategory: item}); setCatOpen(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="form-item flex-grow-item" style={{ position: 'relative' }}>
            {formData.subCategory && formData.name && (
              <div className="modern-ai-badge">
                <div className="pulse-dot"></div>
                <span className="badge-text">{formData.subCategory}</span>
                <div className="badge-tail"></div>
              </div>
            )}
            <input 
              type="text" 
              className={`modern-input ${formData.subCategory && formData.name ? 'input-active' : ''}`}
              placeholder="Материалдын аты..." 
              value={formData.name} 
              onChange={handleNameChange} 
              onBlur={(e) => {
                setTimeout(() => setSuggestions([]), 200);
                detectSubCategory(e.target.value);
              }} 
            />
            
            {suggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {suggestions.map((p, i) => (
                  <div key={i} style={styles.suggestionItem} onClick={() => selectSuggestion(p)} onMouseDown={(e) => e.preventDefault()}>
                     <b>{p.name}</b> — {p.mainCategory}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-item small-item custom-dropdown-container">
            <div className={`custom-dropdown-trigger blue-border-always ${unitOpen ? 'is-open' : ''}`} onClick={() => setUnitOpen(!unitOpen)}>
              <span className="selected-value">{formData.unit}</span>
              <span className="arrow-icon"></span>
            </div>
            {unitOpen && (
              <div className="custom-dropdown-menu">
                {['кг', 'шт', 'метр', 'пач', 'мешок', 'м²'].map(item => (
                  <div key={item} className="dropdown-option" onClick={() => { setFormData({...formData, unit: item}); setUnitOpen(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="form-item medium-item">
            <input type="number" className="screenshot-input-style" placeholder="Баасы" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>

          <button className="btn-add-main" onClick={handleSave} disabled={loading}>{loading ? "..." : "КОШУУ"}</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr><th>№</th><th>Материал</th><th>Башкы Кат.</th><th>Ички Кат.</th><th>Баасы</th><th>Бирдик</th><th>Аракет</th></tr>
          </thead>
          <tbody>
            {filtered.map((p, index) => (
              <tr key={p.id}>
                <td className="col-no">{index + 1}</td>
                <td className="col-name">{p.name}</td>
                <td><span className="badge-main">{p.mainCategory}</span></td>
                <td><span className="badge-sub">{p.subCategory || '---'}</span></td>
                <td className="col-price">{p.price.toLocaleString()} сом</td>
                <td>{p.unit}</td>
                <td><button className="btn-delete" onClick={() => confirmDelete(p)}>Өчүрүү</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;