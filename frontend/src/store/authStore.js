import { create } from "zustand";

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,

  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  updateAvatar: (avatarUrl) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatar: avatarUrl };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));

export default useAuthStore;
