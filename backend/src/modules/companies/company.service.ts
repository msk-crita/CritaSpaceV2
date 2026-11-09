import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase";
import { Company } from "./company.types";
import { AuditLog } from "../audit-logs/audit.types";
import { UserProfile } from "../users/user.types";

const companiesCollection = firestore.collection("companies");
const companyNameIndexes = firestore.collection("company_name_indexes");

// Normalize company names consistently
const normalizeCompanyName = (name: string): string => {
  return name.trim().replace(/\s+/g, " ").normalize("NFKC").toLowerCase();
};

// Generate a deterministic Firestore document ID
const getNameIndexRef = (normalizedName: string) => {
  const hash = createHash("sha256").update(normalizedName).digest("hex");

  return companyNameIndexes.doc(hash);
};

// Create Company
export const createCompany = async (
  name: string,
  admin: UserProfile,
): Promise<Company> => {
  const displayName = name.trim().replace(/\s+/g, " ");
  const normalizedName = normalizeCompanyName(name);

  if (!normalizedName) {
    throw new Error("Company name is required");
  }

  const companyRef = companiesCollection.doc();
  const nameIndexRef = getNameIndexRef(normalizedName);
  const now = Timestamp.now();
  const auditLogRef = firestore.collection("audit_logs").doc();

  const company: Company = {
    id: companyRef.id,
    name: displayName,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: admin.uid,
  };

  await firestore.runTransaction(async (transaction) => {
    const indexDoc = await transaction.get(nameIndexRef);

    // Also check existing company records created before indexing
    const existingCompanies = await transaction.get(
      companiesCollection
        .where("normalizedName", "==", normalizedName)
        .limit(1),
    );

    if (indexDoc.exists || !existingCompanies.empty) {
      throw new Error("A company with this name already exists");
    }

    transaction.set(companyRef, {
      ...company,
      normalizedName,
    });

    transaction.create(nameIndexRef, {
      companyId: companyRef.id,
      normalizedName,
      companyName: displayName,
      createdAt: now,
    });
    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "company.created",
      entityType: "company",
      entityId: companyRef.id,
      description: `Created company "${displayName}"`,
      reason: null,
      metadata: {
        companyName: displayName,
        status: company.status,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);
  });

  return company;
};

// Get All Companies
export const getAllCompanies = async (): Promise<Company[]> => {
  const snapshot = await companiesCollection.orderBy("createdAt", "desc").get();

  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Company);
};

// Get Company By ID
export const getCompanyById = async (
  companyId: string,
): Promise<Company | null> => {
  const companyDoc = await companiesCollection.doc(companyId).get();

  if (!companyDoc.exists) {
    return null;
  }

  return {
    ...companyDoc.data(),
    id: companyDoc.id,
  } as Company;
};

// Update Company
export const updateCompany = async (
  companyId: string,
  updates: {
    name?: string;
    status?: Company["status"];
  },
  admin: UserProfile,
): Promise<Company> => {
  const companyRef = companiesCollection.doc(companyId);

  if (updates.name !== undefined && !updates.name.trim()) {
    throw new Error("Company name is required");
  }

  if (
    updates.status !== undefined &&
    updates.status !== "active" &&
    updates.status !== "inactive"
  ) {
    throw new Error("Invalid company status");
  }

  return firestore.runTransaction(async (transaction) => {
    const companyDoc = await transaction.get(companyRef);

    if (!companyDoc.exists) {
      throw new Error("Company not found");
    }

    const currentCompany = companyDoc.data() as Company;

    const oldNormalizedName = normalizeCompanyName(currentCompany.name);

    const displayName =
      updates.name !== undefined
        ? updates.name.trim().replace(/\s+/g, " ")
        : currentCompany.name;

    const newNormalizedName = normalizeCompanyName(displayName);

    const nameChanged = oldNormalizedName !== newNormalizedName;

    const newIndexRef = getNameIndexRef(newNormalizedName);
    const newIndexDoc = await transaction.get(newIndexRef);

    // Check for duplicate legacy records as well
    const duplicateCompanies = await transaction.get(
      companiesCollection
        .where("normalizedName", "==", newNormalizedName)
        .limit(2),
    );

    const hasDuplicateCompany = duplicateCompanies.docs.some(
      (doc) => doc.id !== companyId,
    );

    if (
      (newIndexDoc.exists && newIndexDoc.data()?.companyId !== companyId) ||
      hasDuplicateCompany
    ) {
      throw new Error("A company with this name already exists");
    }

    const oldIndexRef = getNameIndexRef(oldNormalizedName);

    const oldIndexDoc = nameChanged ? await transaction.get(oldIndexRef) : null;

    const now = Timestamp.now();
    const auditLogRef = firestore.collection("audit_logs").doc();
    const updatedCompany: Company = {
      ...currentCompany,
      name: displayName,
      status: updates.status ?? currentCompany.status,
      updatedAt: now,
    };

    transaction.update(companyRef, {
      name: updatedCompany.name,
      status: updatedCompany.status,
      updatedAt: now,
      normalizedName: newNormalizedName,
    });
    const changes: Record<string, unknown> = {};

    if (nameChanged) {
      changes.name = {
        previous: currentCompany.name,
        updated: updatedCompany.name,
      };
    }

    if (
      updates.status !== undefined &&
      updates.status !== currentCompany.status
    ) {
      changes.status = {
        previous: currentCompany.status,
        updated: updatedCompany.status,
      };
    }

    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "company.updated",
      entityType: "company",
      entityId: companyId,
      description: `Updated company "${updatedCompany.name}"`,
      reason: null,
      metadata: {
        changes,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);

    // Create or refresh the new name index
    transaction.set(newIndexRef, {
      companyId,
      normalizedName: newNormalizedName,
      companyName: displayName,
      createdAt: newIndexDoc.exists
        ? (newIndexDoc.data()?.createdAt ?? now)
        : now,
    });

    // Remove the old index only if it belongs to this company
    if (
      nameChanged &&
      oldIndexDoc?.exists &&
      oldIndexDoc.data()?.companyId === companyId
    ) {
      transaction.delete(oldIndexRef);
    }

    return updatedCompany;
  });
};
