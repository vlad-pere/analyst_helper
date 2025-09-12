// src/components/Sidebar.js

import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ isCollapsed, onToggle }) {
  // NavLink автоматически добавляет класс 'active', когда его `to` совпадает с текущим URL
  const getLinkClass = ({ isActive }) => isActive ? "menu-item active" : "menu-item";

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo">{isCollapsed ? 'BA' : 'Business Analyst Tools'}</span>
      </div>
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/use-case" className={getLinkClass}>
            <span className="menu-icon">📄</span>
            <span className="menu-text">Use Cases (UC)</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/mapping" className={getLinkClass}>
            <span className="menu-icon">⇄</span>
            <span className="menu-text">Data Mapping</span>
          </NavLink>
        </li>
      </ul>
      <div className="sidebar-toggle" onClick={onToggle}>
        <span className="menu-icon">{isCollapsed ? '»' : '«'}</span>
        <span className="menu-text">Свернуть</span>
      </div>
    </aside>
  );
}

export default Sidebar;