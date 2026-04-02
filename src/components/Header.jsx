import React from 'react';

const Header = ({ onToggleSidebar, onExportWord, onAdminClick }) => {
	return (
		<div className="header" style={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: '0 15px',
			height: '60px',
			background: '#fff',
			borderBottom: '1px solid #ddd',
			position: 'relative'
		}}>
			
			{/* Сол жагы: Меню жана Логотип */}
			<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
				<button className="mobile-menu-btn" onClick={onToggleSidebar} style={{ fontSize: '22px', background: 'none', border: 'none' }}>
					☰
				</button>
				<div className="logo" style={{ fontWeight: 'bold', fontSize: '18px' }}>База</div>
			</div>

			{/* Оң жагы: Кнопкалар */}
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				
				{/* + КНОПКАСЫ: Бул кнопка телефондо да, компьютерде да ДАЙЫМА көрүнөт */}
				<button 
					onClick={onAdminClick}
					style={{
						backgroundColor: "#28a745",
						color: "white",
						border: "none",
						width: "36px",
						height: "36px",
						borderRadius: "50%",
						fontSize: "24px",
						fontWeight: "bold",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						cursor: "pointer",
						zIndex: 10,
						boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
					}}
				>
					+
				</button>

				{/* WORD жана ПЕЧАТЬ: Булар үчүн атайын класс калтырабыз */}
				<div className="hide-on-mobile" style={{ display: 'flex', gap: '8px' }}>
					<button className="btn-word" onClick={onExportWord}>Word</button>
					<button className="btn-print" onClick={() => window.print()}>Печать</button>
				</div>
			</div>
		</div>
	);
};

export default Header;