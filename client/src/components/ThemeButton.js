import nightwind from 'nightwind/helper';
import React, { useState } from 'react';

function ThemeButton() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    nightwind.toggle();
  };
  return (
    // when restarting the app this component is not
    // visible on the page for some reason
    // after I copy the button code to the Register.js
    // and right aftere I delete it it just pops up
    // very weird
    <button
      type='button'
      className={`rounded-full w-14 h-8 flex items-center justify-${
        isDarkMode ? 'end' : 'start'
      } bg-gray-300 dark:bg-gray-700 absolute z-10`}
      onClick={toggleDarkMode}
      style={{
        right: '1rem',
        top: '1rem',
      }}
    >
      <span
        className={`rounded-full w-6 h-6 bg-white dark:bg-gray-200 shadow-md transform `}
        style={{
          transform: `translate3d(${
            isDarkMode ? 'calc(100% + 4px)' : '4px'
          }, 0, 0)`,
          marginLeft: `${isDarkMode ? '-1px' : '0'}`,
          transition: 'transform linear 200ms',
        }}
      />
    </button>
  );
}

export default ThemeButton;
