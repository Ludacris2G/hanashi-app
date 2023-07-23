import React, { useContext } from 'react';
import Register from './Register';
import { UserContext } from './UserContext';

export default function Routes() {
  const { username, id } = useContext(UserContext);
  console.log(username, id);

  if (username && id) return <p>Logged in !</p>;

  return <Register />;
}
