import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';

function Chats() {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5001');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
  }, []);

  function handleMessage(e) {
    console.log('new message ', e);
  }

  return (
    <div className='flex h-screen w-screen'>
      <div className='bg-primary-950 w-1/3 text-primary-100'>contacts</div>
      <div className='flex flex-col bg-primary-800 w-2/3 p-2'>
        <div className='flex-grow text-primary-100'>
          messages with selected person
        </div>
        <div className='flex gap-2'>
          <input
            type='text'
            className='bg-primary-100 border p-2 flex-grow rounded-sm'
            placeholder='Type here broseph'
          />
          <button className='bg-primary-900 p-2 text-primary-100 rounded-sm'>
            <svg
              viewBox='0 0 24 24'
              fill='currentColor'
              height='1em'
              width='1em'
              className='text-primary-50'
            >
              <path fill='none' d='M0 0h24v24H0z' />
              <path d='M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chats;
