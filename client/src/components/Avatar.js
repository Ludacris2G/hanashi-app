import React from 'react';

function Avatar({ userId, username }) {
  return (
    <div
      className='bg-primary-800 rounded-full flex items-center'
      style={{ width: '35px', height: '35px' }}
    >
      <div className='text-center w-full text-primary-100 font-bold'>
        {username[0]}
      </div>
    </div>
  );
}

export default Avatar;
