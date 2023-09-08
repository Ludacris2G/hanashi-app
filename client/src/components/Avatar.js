import React from 'react';

function Avatar({ username, online }) {
  return (
    <div
      className='bg-primary-800 relative rounded-full flex items-center'
      style={{ width: '35px', height: '35px' }}
    >
      <div className='text-center w-full text-primary-100 font-bold select-none'>
        {username && username[0]}
        {online && (
          <div
            className='absolute rounded-full border-primary-900 border'
            style={{
              height: '10px',
              width: '10px',
              right: '2px',
              bottom: '1px',
              backgroundColor: '#32fc39',
            }}
          ></div>
        )}
        {!online && (
          <div
            className='absolute rounded-full border-primary-900 border'
            style={{
              height: '10px',
              width: '10px',
              right: '2px',
              bottom: '1px',
              backgroundColor: 'gray',
            }}
          ></div>
        )}
      </div>
    </div>
  );
}

export default Avatar;
