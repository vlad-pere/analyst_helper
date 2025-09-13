// --- START OF FILE src/index.js ---

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css'; // <-- Добавить
import './styles/global.css'; 
import { BrowserRouter } from 'react-router-dom';
import { enableMapSet } from 'immer';
import App from './App';

enableMapSet();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);