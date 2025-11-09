
import { useAuth } from "./useAuth";
/**
 * Hook to easily get Authorization header value for XHR or fetch calls.
 * Example:
 * const getHeader = useAuthHeader();
 * xhr.setRequestHeader('Authorization', getHeader());
 */
export default function useAuthHeader() {
  const { getAccessToken } = useAuth();
  return () => {
    const token = getAccessToken();
    return token ? `Bearer ${token}` : null;
  };
}