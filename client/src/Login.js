import React from 'react';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <>
      {/* REGISTER FORM */}
      <form
        style={{ width: '200px' }}
        className='w-50 mx-auto mb-12'
        // onSubmit={''}
      >
        <input
          className='block w-full rounded-sm p-2 mb-2 border'
          type='text'
          placeholder='username'
          //   value={''}
          //   onChange={'(e) => setUsername(e.target.value)'}
        />
        <input
          className='block w-full rounded-sm p-2 mb-2 border'
          type='password'
          placeholder='password'
          //   value={'password'}
          //   onChange={'(e) => setPassword(e.target.value)'}
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
        {/* {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>} */}
      </form>
    </>
  );
}

export default Login;
