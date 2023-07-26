import React, { useContext } from 'react';
import Register from './Register';
import { UserContext } from './UserContext';

export default function Routes() {
  const { username, id } = useContext(UserContext);

  if (username && id) return <p>Hello {username} ! </p>;

  return <Register />;
}
