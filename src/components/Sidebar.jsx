import React, { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const Sidebar = ({ isOpen, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openMain, setOpenMain] = useState(null);
  const [openSub, setOpenSub] = useState(null);
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "all_products"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const grouped = transformData(products);
      setMenuData(grouped);
    });

    return () => unsubscribe();
  }, []);

  // ТРАНСФОРМАЦИЯ: Эми Башкы категориянын ичинде ички папкалар (AI аныктаган) болот
  const transformData = (products) => {
    const groups = {};

    products.forEach(p => {
      // 1. Башкы категория (мис: Строй материал)
      const mainTitle = p.mainCategory || "Башкалар";
      
      // 2. Ички категория (AI аныктаган түрү: Цемент, Кабель ж.б.)
      // Эгер AI аныктай элек болсо, аны "Жалпы" папкасына салат
      const subTitle = p.subCategory || "Жалпы";

      if (!groups[mainTitle]) {
        groups[mainTitle] = { mainTitle, categories: {} };
      }

      if (!groups[mainTitle].categories[subTitle]) {
        groups[mainTitle].categories[subTitle] = { title: subTitle, items: [] };
      }

      groups[mainTitle].categories[subTitle].items.push({
        n: p.name,
        u: p.unit,
        p: p.price
      });
    });

    return Object.values(groups).map(g => ({
      ...g,
      categories: Object.values(g.categories)
    }));
  };

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setOpenMain(true); 
      setOpenSub(true);
    }
  }, [searchTerm]);

  const toggleMain = (index) => {
    setOpenMain(openMain === index ? null : index);
    setOpenSub(null);
  };

  const filteredMenu = menuData
    .map((main) => {
      const filteredCategories = main.categories
        .map((cat) => ({
          ...cat,
          items: (cat.items || []).filter((item) =>
            item.n.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter((cat) => cat.items.length > 0);
      return { ...main, categories: filteredCategories };
    })
    .filter((main) => main.categories.length > 0);

  return (
    <div className={`sidebar ${isOpen ? "active" : ""}`}>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Издөө..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="sidebar-content">
        {filteredMenu.length > 0 ? (
          filteredMenu.map((mainGroup, mIdx) => {
            const isMainActive = searchTerm !== "" ? true : openMain === mIdx;
            
            return (
              <div key={mIdx} className={`main-group-wrapper ${isMainActive ? "active" : ""}`}>
                {/* 1-деңгээл: Башкы категория (мис: Строй материал) */}
                <div className="main-cat-btn" onClick={() => toggleMain(mIdx)}>
                  <span>{mainGroup.mainTitle}</span>
                  <div className={`arrow-icon ${isMainActive ? "down" : ""}`}></div>
                </div>

                <div className="sub-menu-accordion">
                  <div className="accordion-inner">
                    {mainGroup.categories.map((cat, cIdx) => {
                      const subId = `${mIdx}-${cIdx}`;
                      const isSubActive = searchTerm !== "" ? true : openSub === subId;

                      return (
                        <div key={cIdx} className={`cat-group ${isSubActive ? "active" : ""}`}>
                          {/* 2-деңгээл: Ички категория (мис: Цемент) */}
                          <div className="sub-cat" onClick={(e) => {
                              e.stopPropagation();
                              setOpenSub(openSub === subId ? null : subId);
                            }}>
                            <span>{cat.title}</span>
                            <div className={`arrow-icon small ${isSubActive ? "down" : ""}`}></div>
                          </div>

                          {/* 3-деңгээл: Товарлардын тизмеси (мис: М400) */}
 <div className="product-list-accordion">
  <div className="accordion-inner">
    {cat.items.map((item, i) => (
      <div
  key={i}
  className="product-item"
  onClick={() => {
    onSelectProduct(item.n, item.u, item.p);

   
    setOpenMain(null);
    setOpenSub(null);

    setSearchTerm("");
  }}
>
    
        <span className="p-name">{item.n}</span>
        
      </div>
    ))}
  </div>
</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            {searchTerm ? "Эч нерсе табылган жок" : "Жүктөлүүдө..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;