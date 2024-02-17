export const getUserInfo = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

export const signOut = () => {
  localStorage.removeItem('user');
};