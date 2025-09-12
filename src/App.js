// src/App.js

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import UseCaseToolPage from './features/UseCaseTool/UseCaseToolPage';
import MappingToolPage from './features/MappingTool/MappingToolPage'; 

const SIDEBAR_STATE_KEY = 'sidebar-collapsed-state';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      return savedState ? JSON.parse(savedState) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isSidebarCollapsed));
    } catch (e) {
      console.error("Не удалось сохранить состояние сайдбара", e);
    }
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="app-wrapper">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      
      <main className="main-content">
        <Routes>
          {/* Главная страница будет перенаправлять на редактор Use Case */}
          <Route path="/" element={<Navigate to="/use-case" replace />} />
          <Route path="/use-case" element={<UseCaseToolPage />} />
          <Route path="/mapping" element={<MappingToolPage />} />
          {/* Можно добавить страницу 404 в будущем */}
          <Route path="*" element={<Navigate to="/use-case" replace />} /> 
        </Routes>
      </main>
    </div>
  );
}

export default App;