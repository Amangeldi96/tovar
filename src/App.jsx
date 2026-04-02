import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import MainContent from "./components/MainContent.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import Login from "./components/Login.jsx"; 
import "./components/css/style.css"; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route 
          path="/admin" 
          element={user ? <AdminPanel onBack={() => window.history.back()} /> : <Login onBack={() => window.history.back()} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;