import axios from 'axios';
import Register from './Register';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useState } from 'react';
import NotFound from './NotFound';
import Chats from './Chats';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import PublicLayout from './components/PublicLayout';
import nightwind from 'nightwind/helper';

function App() {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    nightwind.toggle();
  };

  axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
  axios.defaults.withCredentials = true;
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes: */}
          <Route element={<PublicLayout />}>
            <Route
              path='/'
              element={
                <Register
                  toggleDarkMode={toggleDarkMode}
                  isDarkMode={isDarkMode}
                  setUser={setUser}
                />
              }
            />
            <Route
              path='/login'
              element={
                <Login
                  toggleDarkMode={toggleDarkMode}
                  isDarkMode={isDarkMode}
                  setUser={setUser}
                />
              }
            />
          </Route>

          {/* Private route: Chats */}
          <Route element={<PublicLayout />}>
            <Route
              path='/chats'
              element={
                <ProtectedRoute user={user} redirectPath='/'>
                  <Chats
                    toggleDarkMode={toggleDarkMode}
                    isDarkMode={isDarkMode}
                  />
                </ProtectedRoute>
              }
            ></Route>
          </Route>

          {/* Not Found Route */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
