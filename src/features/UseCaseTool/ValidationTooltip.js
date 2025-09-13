import React from 'react';

function ValidationTooltip({ errors, isOpen }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="validation-tooltip">
            <ul className="validation-list">
                {errors.length === 0 ? (
                    <li className="ok">✅ Все отлично!</li>
                ) : (
                    errors.map((error, index) => <li key={index} className="error">❌ {error}</li>)
                )}
            </ul>
        </div>
    );
}

export default ValidationTooltip;