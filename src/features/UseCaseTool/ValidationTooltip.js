import React from 'react';
import ReactDOM from 'react-dom';
function ValidationTooltip({ errors, isOpen, position }) {
if (!isOpen) {
return null;
}
const tooltipContent = (
<div className="validation-tooltip" style={{ top: position.top, left: position.left }}>
<ul className="validation-list">
{errors.length === 0 ? (
<li className="ok">✅ Все отлично!</li>
) : (
errors.map((error, index) => <li key={index} className="error">❌ {error}</li>)
)}
</ul>
</div>
);
return ReactDOM.createPortal(
tooltipContent,
document.getElementById('tooltip-root')
);
}
export default ValidationTooltip;