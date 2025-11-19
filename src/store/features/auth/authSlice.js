import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = '!Aut#!@';
const AUTH_KEY = 'auth'; // compact snapshot we control

const safeParse = (str, fallback = null) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
};

const token = sessionStorage.getItem(TOKEN_KEY);
const persisted = safeParse(sessionStorage.getItem(AUTH_KEY), null);

const roleFrom = (r) => (r ? String(r).toLowerCase() : null);

// NOTE: keeping `isUser` to match your existing code (it means "isCompany")
const initialState = {
  isLogin: !!token,
  user: persisted?.user ?? null,
  role: roleFrom(persisted?.role),
  token: token ?? persisted?.token ?? null,
  isUser: roleFrom(persisted?.role) === 'company',
  // optional: clearer alias if you want to use it elsewhere
  isCompany: roleFrom(persisted?.role) === 'company',
};

export const login = createAsyncThunk("auth/email", async (data) => {
  try {
    const response = await AxiosDefault({
      method: "POST",
      url: "login",
      data: data,
    });
    return response.data;
  } catch (err) {
    return err.response?.data;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const payload = action.payload || {};
      const role = roleFrom(payload.role);

      state.user = payload;
      state.role = role;
      state.token = payload.token ?? state.token ?? null;
      state.isLogin = true;
      state.isUser = role === 'company';
      state.isCompany = role === 'company';

      // persist a compact snapshot we can safely rehydrate later
      try {
        sessionStorage.setItem(
          AUTH_KEY,
          JSON.stringify({
            user: payload,
            role,
            token: state.token,
          })
        );
        if (payload.token) {
          sessionStorage.setItem(TOKEN_KEY, payload.token);
        }
      } catch {
        // ignore storage errors
      }
    },

    signOut: (state) => {
      state.isLogin = false;
      state.user = null;
      state.role = null;
      state.token = null;
      state.isUser = false;
      state.isCompany = false;

      // Only remove what we set; don't nuke the whole localStorage
      try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(AUTH_KEY);
      } catch {
        // ignore storage errors
      }
    },
  },
});

export const { setUser, signOut } = authSlice.actions;
export default authSlice.reducer;
