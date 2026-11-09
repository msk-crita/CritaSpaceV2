import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { env } from "../config/env";

const firebaseApp = initializeApp(env.firebase);

export const auth = getAuth(firebaseApp);

export default firebaseApp;
