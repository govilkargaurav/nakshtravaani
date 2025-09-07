export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem('adminToken');
};

export const setAuth = (user, token) => {
  localStorage.setItem('adminUser', JSON.stringify(user));
  localStorage.setItem('adminToken', token);
};

export const clearAuth = () => {
  localStorage.removeItem('adminUser');
  localStorage.removeItem('adminToken');
};

export const isAuthenticated = () => {
  const token = getStoredToken();
  const user = getStoredUser();
  return !!(token && user);
};