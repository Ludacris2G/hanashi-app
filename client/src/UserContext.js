import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await axios.get('/api/v1/auth/profile');
        console.log({ data });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (username) fetchData();
  }, [username]);
  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
