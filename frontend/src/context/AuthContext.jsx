import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true); // Para esperar a que lea el localStorage

  useEffect(() => {
    // Recuperar la sesión al cargar la página
    const storedUser = localStorage.getItem('sportify_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setRole(parsedUser.rol || 'ALUMNO'); // Fallback si no viene el rol
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Asumimos que userData viene completo del backend (incluyendo el rol)
    setUser(userData);
    setIsAuthenticated(true);
    setRole(userData.rol || 'ALUMNO');
    localStorage.setItem('sportify_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem('sportify_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
