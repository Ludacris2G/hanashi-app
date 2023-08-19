import React from 'react';
import Avatar from './Avatar';

function People({ selectedUserId, onlinePeople, userId, online }) {
  return (
    <div
      className={
        ' border rounded-full border-primary-900 m-1 flex items-center gap-2 cursor-pointer ' +
        (userId === selectedUserId ? 'bg-primary-500' : '')
      }
      style={{ cursor: 'pointer' }}
      key={userId}
    >
      <Avatar online={online} username={onlinePeople[userId]} />
      <span>{onlinePeople[userId]}</span>
    </div>
  );
}

export default People;
