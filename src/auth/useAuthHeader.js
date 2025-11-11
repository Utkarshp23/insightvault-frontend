
import { useAuth } from "./useAuth";

export default function useAuthHeader() {
  const { getAccessToken } = useAuth();
  return () => {
    const token = getAccessToken();
    return token ? `Bearer ${token}` : null;
  };
}