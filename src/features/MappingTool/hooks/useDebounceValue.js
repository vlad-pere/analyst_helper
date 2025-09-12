import { useState, useEffect } from 'react';

export function useDebounceValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Устанавливаем таймер, который обновит значение
    // только после того, как пользователь перестанет печатать на `delay` мс.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Эта функция будет вызвана при каждом новом запуске эффекта (т.е. при изменении `value`)
    // Она отменяет предыдущий таймер, не давая ему сработать.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Эффект перезапускается только если `value` или `delay` изменились

  return debouncedValue;
}