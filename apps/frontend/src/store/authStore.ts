import { create } from "zustand";
import type { User, SignupInput, LoginInput } from "@kanban/types";
import { authApi } from "../lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  signup: (input: SignupInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  isLoading: false,

  signup: async (input) => {
    const { user, token } = await authApi.signup(input);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },

  login: async (input) => {
    const { user, token } = await authApi.login(input);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    set({ isLoading: true });
    try {
      const user = await authApi.me();
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
