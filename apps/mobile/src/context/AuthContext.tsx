import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  setUnauthorizedHandler,
} from "../services/api";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../services/authStorage";

import {
  User,
} from "../types/api";


type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<void>;

  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  signOut: () => Promise<void>;

  refreshUser:
    () => Promise<void>;
};


const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );


type AuthProviderProps = {
  children: ReactNode;
};


export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] = useState<User | null>(
    null
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(
    true
  );


  async function clearSession() {
    await clearAccessToken();

    setUser(
      null
    );
  }


  async function refreshUser() {
    const currentUser =
      await getCurrentUser();

    setUser(
      currentUser
    );
  }


  useEffect(() => {
    let mounted = true;

    const removeUnauthorizedHandler =
      setUnauthorizedHandler(
        async () => {
          await clearAccessToken();

          if (mounted) {
            setUser(
              null
            );
          }
        }
      );


    async function bootstrapSession() {
      try {
        const token =
          await getAccessToken();

        if (!token) {
          return;
        }

        const currentUser =
          await getCurrentUser();

        if (mounted) {
          setUser(
            currentUser
          );
        }
      } catch {
        await clearAccessToken();

        if (mounted) {
          setUser(
            null
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(
            false
          );
        }
      }
    }


    void bootstrapSession();


    return () => {
      mounted = false;

      removeUnauthorizedHandler();
    };
  }, []);


  async function signIn(
    email: string,
    password: string
  ) {
    const tokenResponse =
      await loginUser({
        email:
          email.trim().toLowerCase(),

        password,
      });

    await setAccessToken(
      tokenResponse.access_token
    );

    try {
      await refreshUser();
    } catch (error) {
      await clearSession();

      throw error;
    }
  }


  async function signUp(
    name: string,
    email: string,
    password: string
  ) {
    const normalizedEmail =
      email.trim().toLowerCase();

    await registerUser({
      name:
        name.trim(),

      email:
        normalizedEmail,

      password,
    });

    await signIn(
      normalizedEmail,
      password
    );
  }


  async function signOut() {
    await clearSession();
  }


  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated:
          user !== null,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}