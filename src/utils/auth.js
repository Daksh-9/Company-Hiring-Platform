export const getStoredRole = () => {
  try {
    return localStorage.getItem('role');
  } catch (_) {
    return null;
  }
};

export const getAdminToken = () => {
  try {
    return localStorage.getItem('adminToken');
  } catch (_) {
    return null;
  }
};

export const isAdminAuthenticated = () => {
  const role = getStoredRole();
  const token = getAdminToken();
  return role === 'admin' && !!token;
};

export const logoutAdmin = () => {
  try {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminID');
    localStorage.removeItem('role');
  } catch (_) {
    // ignore
  }
};



