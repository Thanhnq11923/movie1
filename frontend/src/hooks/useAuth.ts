import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import type { LoginRequest, RegisterRequest, User } from '../types/user';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = () => {
            const user = authService.getCurrentUser();
            const isAuthenticated = authService.isAuthenticated();

            setAuthState({
                user,
                isAuthenticated,
                isLoading: false,
            });
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (credentials: LoginRequest) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await authService.login(credentials);

            if (response.success && response.data) {
                setAuthState({
                    user: response.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                });
                return { success: true, data: response.data };
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return { success: false, error: response.message };
            }
        } catch (error: unknown) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            const errorMessage = error instanceof Error ? error.message : 'Invalid username or password';
            return { success: false, error: errorMessage };
        }
    }, []);

    const register = useCallback(async (userData: RegisterRequest) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await authService.register(userData);

            if (response.success && response.data) {
                setAuthState({
                    user: response.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                });
                return { success: true, data: response.data };
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return { success: false, error: response.message };
            }
        } catch (error: unknown) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            return { success: false, error: errorMessage };
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    const updateUser = useCallback((user: User) => {
        setAuthState(prev => ({
            ...prev,
            user,
        }));
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user));
    }, []);

    return {
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        login,
        register,
        logout,
        updateUser,
    };
}; 