import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('userToken');
            if (token) {
                try {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser.user);
                } catch (error) {
                    localStorage.removeItem('userToken');
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const response = await authService.login({ email, password });
        setUser(response.user);
        return response;
    };

    const register = async (name, email, password, userType) => {
        const response = await authService.register({ name, email, password, userType });
        setUser(response.user);
        return response;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};