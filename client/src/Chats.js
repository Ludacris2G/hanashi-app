import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';
import { Navigate, useNavigate } from 'react-router-dom';

function Chats({ user }) {
  if (!user) {
    return <Navigate to='/' replace />;
  }

  return (
    <div>
      <p>Hello {user} !</p>
    </div>
  );
}

export default Chats;
