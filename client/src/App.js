import axios from 'axios';
import Register from './Register';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {  useState } from 'react';
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
    </>
  );
}

export default App;
