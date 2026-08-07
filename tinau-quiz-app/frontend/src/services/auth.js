export const saveSession = (token, user) => {
  localStorage.setItem("tinau_token", token);
  localStorage.setItem("tinau_user", JSON.stringify(user));
};

export const getUser = () => {
  const raw = localStorage.getItem("tinau_user");
  return raw ? JSON.parse(raw) : null;
};

export const getToken = () => localStorage.getItem("tinau_token");

export const clearSession = () => {
  localStorage.removeItem("tinau_token");
  localStorage.removeItem("tinau_user");
};

export const isAuthenticated = () => Boolean(getToken());

export const hasRole = (...roles) => {
  const user = getUser();
  return user && roles.includes(user.role);
};
