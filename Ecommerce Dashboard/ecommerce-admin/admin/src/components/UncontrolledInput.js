/**
 * Uncontrolled Input Component
 * Prevents rerendering while typing by using refs and syncing to state only on blur
 */
import React, { useRef, useEffect } from 'react';

const UncontrolledInput = React.forwardRef(({
  name,
  type = 'text',
  defaultValue = '',
  onBlur,
  onChange,
  className,
  placeholder,
  required,
  min,
  max,
  step,
  ...props
}, ref) => {
  const inputRef = useRef(null);
  const valueRef = useRef(defaultValue);

  // Combine refs
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(inputRef.current);
    } else if (ref) {
      ref.current = inputRef.current;
    }
  }, [ref]);

  // Update valueRef when defaultValue changes (for edit mode)
  useEffect(() => {
    if (inputRef.current && defaultValue !== valueRef.current) {
      inputRef.current.value = defaultValue;
      valueRef.current = defaultValue;
    }
  }, [defaultValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    valueRef.current = value;
    // Call onChange if provided (for immediate updates like calculations)
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    // Sync to parent state on blur
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type={type}
      name={name}
      defaultValue={defaultValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      step={step}
      {...props}
    />
  );
});

UncontrolledInput.displayName = 'UncontrolledInput';

export default UncontrolledInput;

