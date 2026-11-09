import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase";
import { Boardroom } from "./boardroom.types";
import { UserProfile } from "../users/user.types";
import { AuditLog } from "../audit-logs/audit.types";

const boardroomsCollection = firestore.collection("boardrooms");
const boardroomNameIndexes = firestore.collection("boardroom_name_indexes");

interface CreateBoardroomInput {
  name: string;
  description: string;
  capacity: number;
  facilities: string[];
  createdBy: string;
  createdByUser: UserProfile;
}

interface UpdateBoardroomInput {
  name?: string;
  description?: string;
  capacity?: number;
  facilities?: string[];
  status?: Boardroom["status"];
}

const normalizeBoardroomName = (name: string): string => {
  return name.trim().replace(/\s+/g, " ").normalize("NFKC").toLowerCase();
};

const getNameIndexRef = (normalizedName: string) => {
  const hash = createHash("sha256").update(normalizedName).digest("hex");

  return boardroomNameIndexes.doc(hash);
};

const normalizeFacilities = (facilities: string[]): string[] => {
  return [
    ...new Map(
      facilities
        .filter((facility) => typeof facility === "string")
        .map((facility) => facility.trim())
        .filter(Boolean)
        .map((facility) => [facility.toLowerCase(), facility]),
    ).values(),
  ];
};

const validateBoardroomDetails = (input: {
  name?: string;
  capacity?: number;
  facilities?: string[];
}): void => {
  if (input.name !== undefined && !input.name.trim()) {
    throw new Error("Boardroom name is required");
  }

  if (
    input.capacity !== undefined &&
    (!Number.isInteger(input.capacity) || input.capacity < 1)
  ) {
    throw new Error("Capacity must be a positive integer");
  }

  if (
    input.facilities !== undefined &&
    (!Array.isArray(input.facilities) ||
      input.facilities.some((facility) => typeof facility !== "string"))
  ) {
    throw new Error("Facilities must be an array of strings");
  }
};

// Create Boardroom
export const createBoardroom = async (
  input: CreateBoardroomInput,
): Promise<Boardroom> => {
  validateBoardroomDetails(input);

  const displayName = input.name.trim().replace(/\s+/g, " ");
  const normalizedName = normalizeBoardroomName(displayName);

  const boardroomRef = boardroomsCollection.doc();
  const nameIndexRef = getNameIndexRef(normalizedName);
  const now = Timestamp.now();
  const auditLogRef = firestore.collection("audit_logs").doc();

  const boardroom: Boardroom = {
    id: boardroomRef.id,
    name: displayName,
    description: input.description.trim(),
    capacity: input.capacity,
    facilities: normalizeFacilities(input.facilities),
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };

  await firestore.runTransaction(async (transaction) => {
    const indexDoc = await transaction.get(nameIndexRef);

    const existingBoardrooms = await transaction.get(
      boardroomsCollection
        .where("normalizedName", "==", normalizedName)
        .limit(1),
    );

    if (indexDoc.exists || !existingBoardrooms.empty) {
      throw new Error("A boardroom with this name already exists");
    }

    transaction.set(boardroomRef, {
      ...boardroom,
      normalizedName,
    });

    transaction.create(nameIndexRef, {
      boardroomId: boardroomRef.id,
      normalizedName,
      boardroomName: displayName,
      createdAt: now,
    });
    const admin = input.createdByUser;

    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "boardroom.created",
      entityType: "boardroom",
      entityId: boardroomRef.id,
      description: `Created boardroom "${displayName}"`,
      reason: null,
      metadata: {
        capacity: boardroom.capacity,
        facilities: boardroom.facilities,
        status: boardroom.status,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);
  });

  return boardroom;
};

// Get All Boardrooms
export const getAllBoardrooms = async (): Promise<Boardroom[]> => {
  const snapshot = await boardroomsCollection
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id }) as Boardroom,
  );
};

// Get Boardroom By ID
export const getBoardroomById = async (
  boardroomId: string,
): Promise<Boardroom | null> => {
  const boardroomDoc = await boardroomsCollection.doc(boardroomId).get();

  if (!boardroomDoc.exists) {
    return null;
  }

  return {
    ...boardroomDoc.data(),
    id: boardroomDoc.id,
  } as Boardroom;
};

// Update Boardroom
export const updateBoardroom = async (
  boardroomId: string,
  updates: UpdateBoardroomInput,
  admin: UserProfile,
): Promise<Boardroom> => {
  validateBoardroomDetails(updates);

  if (
    updates.status !== undefined &&
    !["active", "inactive"].includes(updates.status)
  ) {
    throw new Error("Invalid boardroom status");
  }

  if (
    updates.description !== undefined &&
    typeof updates.description !== "string"
  ) {
    throw new Error("Invalid boardroom description");
  }

  const boardroomRef = boardroomsCollection.doc(boardroomId);

  return firestore.runTransaction(async (transaction) => {
    const boardroomDoc = await transaction.get(boardroomRef);

    if (!boardroomDoc.exists) {
      throw new Error("Boardroom not found");
    }

    const currentBoardroom = {
      ...boardroomDoc.data(),
      id: boardroomDoc.id,
    } as Boardroom;

    const displayName =
      updates.name !== undefined
        ? updates.name.trim().replace(/\s+/g, " ")
        : currentBoardroom.name;

    const oldNormalizedName = normalizeBoardroomName(currentBoardroom.name);

    const newNormalizedName = normalizeBoardroomName(displayName);
    const nameChanged = oldNormalizedName !== newNormalizedName;

    const newIndexRef = getNameIndexRef(newNormalizedName);
    const newIndexDoc = await transaction.get(newIndexRef);

    const duplicateBoardrooms = await transaction.get(
      boardroomsCollection
        .where("normalizedName", "==", newNormalizedName)
        .limit(2),
    );

    const hasDuplicate = duplicateBoardrooms.docs.some(
      (doc) => doc.id !== boardroomId,
    );

    if (
      (newIndexDoc.exists && newIndexDoc.data()?.boardroomId !== boardroomId) ||
      hasDuplicate
    ) {
      throw new Error("A boardroom with this name already exists");
    }

    const oldIndexRef = getNameIndexRef(oldNormalizedName);

    const oldIndexDoc = nameChanged ? await transaction.get(oldIndexRef) : null;

    const now = Timestamp.now();
    const auditLogRef = firestore.collection("audit_logs").doc();

    const updatedBoardroom: Boardroom = {
      ...currentBoardroom,
      name: displayName,
      description: updates.description?.trim() ?? currentBoardroom.description,
      capacity: updates.capacity ?? currentBoardroom.capacity,
      facilities:
        updates.facilities !== undefined
          ? normalizeFacilities(updates.facilities)
          : currentBoardroom.facilities,
      status: updates.status ?? currentBoardroom.status,
      updatedAt: now,
    };

    transaction.update(boardroomRef, {
      name: updatedBoardroom.name,
      description: updatedBoardroom.description,
      capacity: updatedBoardroom.capacity,
      facilities: updatedBoardroom.facilities,
      status: updatedBoardroom.status,
      updatedAt: now,
      normalizedName: newNormalizedName,
    });
    const changes: Record<string, unknown> = {};

    if (currentBoardroom.name !== updatedBoardroom.name) {
      changes.name = {
        previous: currentBoardroom.name,
        updated: updatedBoardroom.name,
      };
    }

    if (currentBoardroom.description !== updatedBoardroom.description) {
      changes.description = {
        previous: currentBoardroom.description,
        updated: updatedBoardroom.description,
      };
    }

    if (currentBoardroom.capacity !== updatedBoardroom.capacity) {
      changes.capacity = {
        previous: currentBoardroom.capacity,
        updated: updatedBoardroom.capacity,
      };
    }

    if (
      JSON.stringify(currentBoardroom.facilities) !==
      JSON.stringify(updatedBoardroom.facilities)
    ) {
      changes.facilities = {
        previous: currentBoardroom.facilities,
        updated: updatedBoardroom.facilities,
      };
    }

    if (currentBoardroom.status !== updatedBoardroom.status) {
      changes.status = {
        previous: currentBoardroom.status,
        updated: updatedBoardroom.status,
      };
    }

    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "boardroom.updated",
      entityType: "boardroom",
      entityId: boardroomId,
      description: `Updated boardroom "${updatedBoardroom.name}"`,
      reason: null,
      metadata: { changes },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);

    transaction.set(newIndexRef, {
      boardroomId,
      normalizedName: newNormalizedName,
      boardroomName: displayName,
      createdAt: newIndexDoc.exists
        ? (newIndexDoc.data()?.createdAt ?? now)
        : now,
    });

    if (
      nameChanged &&
      oldIndexDoc?.exists &&
      oldIndexDoc.data()?.boardroomId === boardroomId
    ) {
      transaction.delete(oldIndexRef);
    }

    return updatedBoardroom;
  });
};
