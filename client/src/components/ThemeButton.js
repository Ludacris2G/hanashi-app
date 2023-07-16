import nightwind from 'nightwind/helper';
import React, { useState } from 'react';

function ThemeButton() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    nightwind.toggle();
  };
  return (
    <button
      type='button'
      className={`rounded-full w-14 h-8 flex items-center justify-${
        isDarkMode ? 'end' : 'start'
      } bg-gray-300 dark:bg-gray-700 transition-transform duration-300 absolute`}
      onClick={toggleDarkMode}
      style={{
        right: '1rem',
        top: '1rem',
      }}
    >
      <span
        className={`rounded-full w-6 h-6 bg-white dark:bg-gray-200 shadow-md transform transition-transform duration-300`}
        style={{
          transform: `translate3d(${
            isDarkMode ? 'calc(100% + 4px)' : '4px'
          }, 0, 0)`,
          marginLeft: `${isDarkMode ? '-1px' : '0'}`,
        }}
      />
      <style jsx>{`
        button:focus {
          outline: none;
        }
      `}</style>
    </button>
  );
}

export default ThemeButton;
