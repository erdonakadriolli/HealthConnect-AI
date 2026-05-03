import { Navigate } from "react-router-dom";
import { getAccessToken } from "../utils/token";

export default function PublicRoute({ children }) {
  const token = getAccessToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}