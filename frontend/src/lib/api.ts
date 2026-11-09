import axios from "axios";
import { auth } from "./firebase";
import { env } from "../config/env";

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});
