import React, { useContext } from 'react';
import { UserContext } from './UserContext';

function Chats() {
  const { username } = useContext(UserContext);
  return (
    <div className='bg-primary-100'>
      <p>Hello {username} !</p>
    </div>
  );
}

export default Chats;
