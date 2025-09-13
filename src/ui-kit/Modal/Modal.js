import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.getElementById('portal-root')
  );
}

export default Modal;