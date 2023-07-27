import React, { useContext } from 'react';
import { UserContext } from './UserContext';

function Chats() {
  const { username, id } = useContext(UserContext);
  return (
    <div>
      <p>Hello {username} !</p>
    </div>
  );
}

export default Chats;
