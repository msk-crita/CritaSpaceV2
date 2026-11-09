import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Timestamp } from "firebase-admin/firestore";
import { firebaseAuth, firestore } from "../config/firebase";
import { UserProfile } from "../modules/users/user.types";

const bootstrapAdmin = async (): Promise<void> => {
  const readline = createInterface({ input: stdin, output: stdout });

  try {
    const existingAdmins = await firestore
      .collection("users")
      .where("role", "==", "global_admin")
      .limit(1)
      .get();

    if (!existingAdmins.empty) {
      throw new Error("A Global Admin already exists. Bootstrap cancelled.");
    }

    const name = (await readline.question("Admin name: ")).trim();
    const email = (await readline.question("Admin email: "))
      .trim()
      .toLowerCase();
    const password = await readline.question("Admin password: ");

    if (!name || !email || password.length < 6) {
      throw new Error(
        "Invalid details. Password must be at least 6 characters.",
      );
    }

    const authUser = await firebaseAuth.createUser({
      displayName: name,
      email,
      password,
      disabled: false,
      emailVerified: false,
    });

    try {
      const now = Timestamp.now();

      const profile: UserProfile = {
        uid: authUser.uid,
        name,
        email,
        companyId: null,
        role: "global_admin",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: null,
      };

      await firestore.collection("users").doc(authUser.uid).set(profile);

      console.log("Initial Global Admin created successfully.");
      console.log(`Admin UID: ${authUser.uid}`);
    } catch (error) {
      await firebaseAuth.deleteUser(authUser.uid);
      throw error;
    }
  } finally {
    readline.close();
  }
};

bootstrapAdmin().catch((error: unknown) => {
  console.error(
    "Bootstrap failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
