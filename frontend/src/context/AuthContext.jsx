import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const normalizarRol = (rol) => {
  const rolNormalizado = (rol || '').toUpperCase();

  if (rolNormalizado === 'ADMIN') return 'ADMINISTRADOR';
  if (rolNormalizado === 'ADMINISTRADOR') return 'ADMINISTRADOR';
  if (rolNormalizado === 'PROFESOR') return 'PROFESOR';
  if (rolNormalizado === 'ALUMNO') return 'ALUMNO';

  console.warn('Rol no reconocido o ausente:', rol);
  return null;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('sportify_user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const rolNormalizado = normalizarRol(parsedUser.rol || parsedUser.role);

      setUser({
        ...parsedUser,
        rol: rolNormalizado
      });

      setIsAuthenticated(true);
      setRole(rolNormalizado);
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    const rolNormalizado = normalizarRol(userData.rol || userData.role);

    const userNormalizado = {
      ...userData,
      rol: rolNormalizado
    };

    setUser(userNormalizado);
    setIsAuthenticated(true);
    setRole(rolNormalizado);

    localStorage.setItem('sportify_user', JSON.stringify(userNormalizado));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setRole(null);
    localStorage.removeItem('sportify_user');
  };

  const updateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('sportify_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, role, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};