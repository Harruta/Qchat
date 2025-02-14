import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

const GuestLoginButton = () => {
  const createTempAccount = useAuthStore((state) => state.createTempAccount);
  
  const handleGuestLogin = async () => {
    try {
      await createTempAccount();
    } catch (error) {
      console.error("Error creating temporary account:", error);
    }
  };

  return (
    <button onClick={handleGuestLogin} className="btn btn-primary">
      Continue as Guest
    </button>
  );
};

export default GuestLoginButton; 