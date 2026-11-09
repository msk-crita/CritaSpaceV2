import { firebaseAuth, firestore } from "../../config/firebase";
import { Timestamp } from "firebase-admin/firestore";
import { UserProfile, UserRole } from "./user.types";
import { AuditLog } from "../audit-logs/audit.types";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  companyId: string | null;
  role: UserRole;
  createdBy: string;
  createdByUser: UserProfile;
}

export const createUserAccount = async (
  input: CreateUserInput,
): Promise<UserProfile> => {
  const { name, email, password, companyId, role, createdBy, createdByUser } =
    input;

  if (!name.trim() || !email.trim() || !password) {
    throw new Error("Name, email and password are required");
  }

  if (!["user", "global_admin"].includes(role)) {
    throw new Error("Invalid user role");
  }

  if (role === "user" && !companyId) {
    throw new Error("Company assignment is required for regular users");
  }

  if (role === "global_admin" && companyId !== null) {
    throw new Error("Global Admin accounts cannot be assigned to a company");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Initial company validation before creating Firebase Auth account
  if (companyId) {
    const companyDoc = await firestore
      .collection("companies")
      .doc(companyId)
      .get();

    if (!companyDoc.exists) {
      throw new Error("Selected company does not exist");
    }

    if (companyDoc.data()?.status !== "active") {
      throw new Error("Cannot assign users to an inactive company");
    }
  }

  const authUser = await firebaseAuth.createUser({
    email: normalizedEmail,
    password,
    displayName: name.trim(),
    disabled: false,
    emailVerified: false,
  });

  try {
    const now = Timestamp.now();

    const userProfile: UserProfile = {
      uid: authUser.uid,
      name: name.trim(),
      email: normalizedEmail,
      companyId,
      role,
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy,
    };

    const userRef = firestore.collection("users").doc(authUser.uid);
    const auditLogRef = firestore.collection("audit_logs").doc();

    // Recheck company status atomically with the user profile write
    await firestore.runTransaction(async (transaction) => {
      if (companyId) {
        const companyRef = firestore.collection("companies").doc(companyId);

        const companyDoc = await transaction.get(companyRef);

        if (!companyDoc.exists) {
          throw new Error("Selected company does not exist");
        }

        if (companyDoc.data()?.status !== "active") {
          throw new Error("Cannot assign users to an inactive company");
        }
      }

      transaction.set(userRef, userProfile);
      const admin = createdByUser;

      const auditLog: AuditLog = {
        id: auditLogRef.id,
        actorId: admin.uid,
        actorName: admin.name,
        actorEmail: admin.email,
        actorRole: admin.role,
        action: "user.created",
        entityType: "user",
        entityId: authUser.uid,
        description: `Created user account for "${userProfile.name}"`,
        reason: null,
        metadata: {
          email: userProfile.email,
          companyId: userProfile.companyId,
          role: userProfile.role,
          status: userProfile.status,
        },
        createdAt: now,
      };

      transaction.create(auditLogRef, auditLog);
    });

    return userProfile;
  } catch (error) {
    try {
      await firebaseAuth.deleteUser(authUser.uid);
    } catch (cleanupError) {
      console.error("Failed to clean up Firebase Auth user:", cleanupError);
    }

    throw error;
  }
};
