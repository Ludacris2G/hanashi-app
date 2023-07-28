import axios from 'axios';
import { UserContext, UserContextProvider } from './UserContext';
import Register from './Register';
import { BrowserRouter, Redirect, Route, Routes } from 'react-router-dom';

import { useContext, useEffect, useState } from 'react';
import NotFound from './NotFound';
import Chats from './Chats';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import PublicLayout from './components/PublicLayout';

function App() {
  const [user, setUser] = useState(null);

  axios.defaults.baseURL = 'http://localhost:5001/';
  axios.defaults.withCredentials = true;

  return (
    <>
      <UserContextProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes: */}
            <Route element={<PublicLayout />}>
              <Route path='/' element={<Register setUser={setUser} />} />
              <Route path='/login' element={<Login setUser={setUser} />} />
            </Route>

            {/* Private route: Chats */}
            <Route element={<PublicLayout />}>
              <Route
                path='/chats'
                element={
                  <ProtectedRoute user={user} redirectPath='/'>
                    <Chats />
                  </ProtectedRoute>
                }
              ></Route>
            </Route>

            {/* Not Found Route */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserContextProvider>
    </>
  );
}

export default App;
