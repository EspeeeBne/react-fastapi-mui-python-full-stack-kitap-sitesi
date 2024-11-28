import React, { useEffect, useState } from 'react';
import api from '../api';
import { Avatar, Button, TextField } from '@mui/material';

const Profile = ({ username }) => {
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profile/${username}`);
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [username]);

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Avatar src={profileData.profile_picture_url} alt="Profile Picture" />
      <h2>{profileData.username}</h2>
      <div>
        <TextField
          label="Profile Picture URL"
          defaultValue={profileData.profile_picture_url}
          variant="outlined"
        />
        <Button variant="contained" onClick={() => alert('Feature in development!')}>
          Update Profile Picture
        </Button>
      </div>
    </div>
  );
};

export default Profile;
