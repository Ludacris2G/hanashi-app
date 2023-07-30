import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isValidToken = async (token) => {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const isValid = await axios.get('/api/v1/auth/profile');
        setUsername('test');
        setId('test1');
      } catch (error) {
        setUsername(null);
        setId(null);
        localStorage.removeItem('token');
      }
    };

    if (token) {
      isValidToken(token);
    } else {
      setUsername(null);
      setId(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
