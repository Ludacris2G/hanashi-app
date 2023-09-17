import React from 'react';
import Avatar from './Avatar';

function People({
  selectedUserId,
  onlinePeople,
  userId,
  online,
  isConversationLoading,
}) {
  return (
    <div
      className={
        'hover:bg-primary-400 transition duration-50 border rounded-full border-primary-900 m-1 flex items-center gap-2 cursor-pointer select-none ' +
        (userId === selectedUserId ? 'bg-primary-500' : '')
      }
      style={{ cursor: isConversationLoading ? 'not-allowed' : 'pointer' }}
      key={userId}
    >
      <Avatar online={online} username={onlinePeople[userId]} />
      <span>{onlinePeople[userId]}</span>
    </div>
  );
}

export default People;
