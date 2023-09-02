import React from 'react';

function ThemeButton({ toggleDarkMode, isDarkMode }) {
  return (
    <button
      type='button'
      className={` rounded-full w-14 h-8 flex items-center justify-${
        isDarkMode ? 'end' : 'start'
      } bg-primary-300 dark:bg-primary-800 `}
      onClick={toggleDarkMode}
      style={{
        backgroundColor: 'gray',
        width: '50px',
        height: '30px',
        zIndex: '10',
        margin: 'auto',
      }}
    >
      <span
        className={`rounded-full w-6 h-6 bg-primary-800 dark:bg-primary-800 shadow-md transform `}
        style={{
          transform: `translate3d(${
            isDarkMode ? 'calc(100% + 4px)' : '4px'
          }, 0, 0)`,
          marginLeft: `${isDarkMode ? '-6px' : '-1px'}`,
          transition: 'transform linear 200ms',
        }}
      />
    </button>
  );
}

export default ThemeButton;
