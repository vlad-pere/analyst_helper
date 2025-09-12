// src/components/ExportControls.js

import React from 'react';

function ExportControls({ onCopy, copyButtonText }) {
  return (
    <div className="export-controls">
      <button onClick={onCopy}>{copyButtonText}</button>
    </div>
  );
}

export default ExportControls;