import React, { useState } from 'react';
import nightwind from 'nightwind/helper';

function Register() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    nightwind.toggle();
  };
  return (
    <>
      <div className='bg-primary-50 dark:bg-primary-950 h-screen flex relative'>
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
        <form className='w-50 mx-auto'>
          <input
            className='block w-full rounded-sm p-2 mb-2'
            type='text'
            placeholder='username'
          />
          <input
            className='block w-full rounded-sm p-2 mb-2'
            type='password'
            placeholder='password'
          />
          <button className='bg-primary-700 text-primary-50  w-full rounded-sm'>
            Register
          </button>
        </form>
      </div>
    </>
  );
}

export default Register;
