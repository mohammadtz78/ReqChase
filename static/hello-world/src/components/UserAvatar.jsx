import React from 'react';
import { Whisper, Popover, Button } from 'rsuite';
import { router } from '@forge/bridge';
import './UserAvatar.css';

// User Profile Popover Content
const UserProfilePopover = ({ user }) => {
  const handleViewProfile = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation to prevent onRowClick from firing
    // Open user profile in a new tab
    router.open(`/jira/people/${user.accountId}`, '_blank');
  };

  return (
    <div className="user-profile-popover">
      <div className="user-profile-header">
        <img 
          src={user.avatarUrl} 
          alt={user.displayName} 
          className="user-profile-avatar" 
        />
        <div className="user-profile-name">{user.displayName}</div>
      </div>
      <div className="user-profile-actions">
        <Button appearance="primary" size="sm" onClick={handleViewProfile}>
          View Profile
        </Button>
      </div>
    </div>
  );
};

// UserAvatar component
const UserAvatar = ({ user }) => {
  if (!user) return <span className="unassigned">Unassigned</span>;
  
  return (
    <Whisper
      placement="auto"
      enterable
      trigger="hover"
      speaker={<Popover><UserProfilePopover user={user} /></Popover>}
    >
      <div className="user-avatar">
        <img 
          src={user.avatarUrl} 
          alt={user.displayName} 
          className="avatar-img" 
        />
        <span className="user-name">{user.displayName}</span>
      </div>
    </Whisper>
  );
};

export default UserAvatar; 