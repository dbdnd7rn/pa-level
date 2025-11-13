"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  User,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { firebaseAuth } from "../../firebase";

export type Role = "tenant" | "landlord" | "admin" | null;

type AuthContextType = {
  user: User | null;
  role: Role;
  loading: boolean;
  setRole: (role: Exclude<Role, null>) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_KEY_PREFIX = "pa_level_role_";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser ?? null);

      if (firebaseUser) {
        const stored =
          typeof window !== "undefined"
            ? window.localStorage.getItem(ROLE_KEY_PREFIX + firebaseUser.uid)
            : null;

        if (stored === "tenant" || stored === "landlord" || stored === "admin") {
          setRoleState(stored);
        } else {
          setRoleState(null);
        }
      } else {
        setRoleState(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const setRole = (newRole: Exclude<Role, null>) => {
    if (!user) return;

    setRoleState(newRole);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_KEY_PREFIX + user.uid, newRole);
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);

    if (typeof window !== "undefined" && user?.uid) {
      window.localStorage.removeItem(ROLE_KEY_PREFIX + user.uid);
    }

    setUser(null);
    setRoleState(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(firebaseAuth, email);
  };

  const value: AuthContextType = {
    user,
    role,
    loading,
    setRole,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
