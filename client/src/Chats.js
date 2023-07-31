import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';

function Chats() {
  const { username, id } = useContext(UserContext);
  
  return (
    <div className='bg-primary-100'>
      <p>
        Hello {username} ! Your user id is {id}
      </p>
    </div>
  );
}

export default Chats;
