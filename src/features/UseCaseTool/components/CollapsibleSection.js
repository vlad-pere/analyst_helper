import React from 'react';
import './CollapsibleSection.css';

function CollapsibleSection({ title, id, isCollapsed, onToggle, isComplete, children }) {
  return (
    <div className="collapsible-section form-group">
      <div className="collapsible-header" onClick={() => onToggle(id)} aria-expanded={!isCollapsed}>
        <span className={`collapsible-icon ${isCollapsed ? 'collapsed' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <label>{title}</label>
        <span className={`completeness-indicator ${isComplete ? 'complete' : 'incomplete'}`}></span>
      </div>
      {!isCollapsed && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;