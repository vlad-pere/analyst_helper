import React from 'react';
import './Button.css';

const Button = React.forwardRef(({ children, onClick, variant = 'secondary', size = 'medium', disabled = false, title = '', className = '', ...rest }, ref) => {
  const classes = `btn btn-${variant} btn-${size} ${className}`;
  
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      title={title}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;