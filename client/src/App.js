import axios from 'axios';
import { UserContext, UserContextProvider } from './UserContext';
import Register from './Register';
import { BrowserRouter, Redirect, Route, Routes } from 'react-router-dom';

import { useContext, useEffect, useState } from 'react';
import NotFound from './NotFound';
import Chats from './Chats';

function App() {
  const [user, setUser] = useState(null);

  axios.defaults.baseURL = 'http://localhost:5001/';
  axios.defaults.withCredentials = true;

  return (
    <>
      <UserContextProvider>
        <BrowserRouter>
          <Routes>
            {/* Public route: Register */}
            <Route path='/' element={<Register setUser={setUser} />} />

            {/* Private route: Chat */}
            <Route path='/chats' element={<Chats user={user} />}></Route>

            {/* Not Found Route */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserContextProvider>
    </>
  );
}

export default App;
