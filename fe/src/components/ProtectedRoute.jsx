import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Empêche l'accès à une page si l'utilisateur n'est pas connecté
// Utilisation : <ProtectedRoute><Dashboard /></ProtectedRoute>
const ProtectedRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;