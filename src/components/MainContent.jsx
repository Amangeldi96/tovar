import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

/** * Стилденген UnitSelect компоненти 
 */
const UnitSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['кг', 'шт', 'метр', 'пач', 'мешок', 'м²', 'м³'];

  return (
    <div className="custom-select-wrapper">
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}</span>
        <span className={`arrow ${isOpen ? 'up' : 'down'}`}></span>
      </div>
      
      {isOpen && (
        <>
          <div className="select-overlay" onClick={() => setIsOpen(false)} />
          <div className="select-dropdown">
            {options.map((opt) => (
              <div 
                key={opt} 
                className={`select-option ${value === opt ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const MainContent = () => {
  const navigate = useNavigate();
  const [db, setDb] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', qty: '', price: '', unit: 'кг' });
  const [indexToDelete, setIndexToDelete] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts([...toasts, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const addItem = () => {
    const { name, qty, price, unit } = formData;
    if (!name || !qty || !price) {
      showToast("Маалыматты толук толтуруңуз!", "danger");
      return;
    }
    setDb([...db, { name, qty: parseFloat(qty), price: parseFloat(price), unit }]);
    setFormData({ name: '', qty: '', price: '', unit: 'кг' });
    showToast("Материал кошулду!");
  };

  const confirmDelete = () => {
    setDb(db.filter((_, i) => i !== indexToDelete));
    setIndexToDelete(null);
    showToast("Материал өчүрүлдү", "danger");
  };

  const totalAmount = db.reduce((sum, item) => sum + (item.qty * item.price), 0);

  /** * Word экспорт: Бир гана Таблица цен (сом алынды)
   */
  const exportWord = () => {
    if (db.length === 0) return;

    const rowsWithPrice = db.map((it, i) => 
      `<tr>
        <td>${i+1}</td>
        <td>${it.name}</td>
        <td>${it.qty}</td>
        <td>${it.unit}</td>
        <td>${it.price.toLocaleString()}</td>
        <td>${(it.qty * it.price).toLocaleString()}</td>
      </tr>`
    ).join('');
    
    const content = `
      <html>
      <head><meta charset='utf-8'></head>
      <body>
        <h2 align='center'>Таблица цен</h2>
        <table border='1' style='width:100%; border-collapse:collapse; text-align:center;'>
          <thead>
            <tr style='background:#f2f2f2;'>
              <th>№</th><th>Наименование</th><th>Кол-во</th><th>Ед.</th><th>Цена</th><th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            ${rowsWithPrice}
            <tr>
              <td colspan='5' align='right'><b>ИТОГО:</b></td>
              <td><b>${totalAmount.toLocaleString()}</b></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`;
    
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Material_Report.doc';
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      {/* ПЕЧАТЬ АЙМАГЫ */}
      <div id="print-area">
        <h1>Таблица цен</h1>
        <table className="p-table">
          <thead>
            <tr>
              <th>№</th><th>Наименование</th><th>Кол-во</th><th>Ед.</th><th>Цена</th><th>Сумма</th>
            </tr>
          </thead>
          <tbody>
            {db.map((item, i) => (
              <tr key={i}>
                <td>{i+1}</td><td>{item.name}</td><td>{item.qty}</td><td>{item.unit}</td>
                <td>{item.price.toLocaleString()}</td><td>{(item.qty * item.price).toLocaleString()}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="5" style={{textAlign: 'right'}}><b>ИТОГО:</b></td>
              <td><b>{totalAmount.toLocaleString()}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      {isSidebarOpen && <div className="sidebar-overlay active" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>

      {indexToDelete !== null && (
        <div className="modal-overlay active">
          <div className="modal-card">
            <div className="modal-icon" style={{color: '#ef4444'}}>✕</div>
            <div className="modal-title">Өчүрүүнү ырастаңыз</div>
            <div className="modal-actions">
              <button className="btn-modal btn-cancel" onClick={() => setIndexToDelete(null)}>Жок</button>
              <button className="btn-modal btn-confirm" onClick={confirmDelete}>Ооба</button>
            </div>
          </div>
        </div>
      )}

      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onExportWord={exportWord}
        onPrint={handlePrint}
        onAdminClick={() => navigate('/admin')}
      />

      <div className="main-layout">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onSelectProduct={(name, unit, price) => {
            setFormData({ ...formData, name, unit, price });
            setIsSidebarOpen(false);
          }} 
        />
        <main className="content">
          <div className="card">
            <div className="form-grid">
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="Материал" 
              />
              <UnitSelect 
                value={formData.unit} 
                onChange={(val) => setFormData({...formData, unit: val})} 
              />
              <input 
                type="number" 
                value={formData.qty} 
                onChange={(e) => setFormData({...formData, qty: e.target.value})} 
                placeholder="Саны" 
              />
              <input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
                placeholder="Баасы" 
              />
              <button className="btn-add" onClick={addItem}>КОШУУ</button>
            </div>
          </div>

          <div className="card table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>№</th><th>Материал</th><th>Саны</th><th>Бирдик</th><th>Баасы</th><th>Сумма</th><th></th>
                </tr>
              </thead>
              <tbody>
                {db.map((item, i) => (
                  <tr key={i}>
                    <td>{i+1}</td><td>{item.name}</td><td>{item.qty}</td><td>{item.unit}</td>
                    <td>{item.price.toLocaleString()}</td><td>{(item.qty * item.price).toLocaleString()}</td>
                    <td><button className="btn-delete-row" onClick={() => setIndexToDelete(i)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Жакшыртылган Footer: Сумма чоң болсо да батыш үчүн */}
      <div className="fixed-footer">
        <div className="footer-content">
          <span className="footer-label">ИТОГО:</span>
          <span className="footer-value">{totalAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default MainContent;