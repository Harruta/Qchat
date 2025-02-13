import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import AuthenticatedApp from "./AuthenticatedApp";
import UnauthenticatedApp from "./UnauthenticatedApp";

function App() {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-base-200">
      {authUser ? <AuthenticatedApp /> : <UnauthenticatedApp />}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App; 