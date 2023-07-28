import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import axios from 'axios';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function logIn(e) {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/v1/auth/register', {
        username,
        password,
      });
      setLoggedInUsername(username);
      setId(data.user.id);
      setUser(username);
      navigate('/chats');
    } catch (error) {
      setError(error.response.data.msg);
      setTimeout(() => setError(null), 3000);
    }
  }

  return (
    <>
      {/* REGISTER FORM */}
      <form
        style={{ width: '200px' }}
        className='w-50 mx-auto mb-12'
        onSubmit={logIn}
      >
        <input
          className='block w-full rounded-sm p-2 mb-2 border'
          type='text'
          placeholder='username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className='block w-full rounded-sm p-2 mb-2 border'
          type='password'
          placeholder='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className='bg-primary-700 text-primary-50  w-full rounded-sm p-2'>
          Log In
        </button>
        <p className='mt-1 text-center text-xs text-primary-900 font-thin'>
          Don't have an account?
          <br />
          <Link to='/' className='text-primary-500 font-normal'>
            Register here!
          </Link>
        </p>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      </form>
    </>
  );
}

export default Login;
