import { Timestamp } from "firebase-admin/firestore";
import { firestore } from "../../config/firebase";
import {
  BoardroomBlock,
  BoardroomBlockType,
} from "./boardroom-maintenance.types";
import { UserProfile } from "../users/user.types";
import { AuditLog } from "../audit-logs/audit.types";

const boardroomsCollection = firestore.collection("boardrooms");
const blocksCollection = firestore.collection("boardroom_blocks");

interface CreateBoardroomBlockInput {
  boardroomId: string;
  type: BoardroomBlockType;
  reason: string;
  startAt: string;
  endAt: string;
  createdBy: string;
  createdByUser: UserProfile;
}

interface UpdateBoardroomBlockInput {
  type?: BoardroomBlockType;
  reason?: string;
  startAt?: string;
  endAt?: string;
}

const parseDateRange = (
  startAt: string,
  endAt: string,
): { start: Timestamp; end: Timestamp } => {
  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  if (
    !Number.isFinite(startDate.getTime()) ||
    !Number.isFinite(endDate.getTime())
  ) {
    throw new Error("Invalid maintenance date or time");
  }

  if (endDate.getTime() <= startDate.getTime()) {
    throw new Error("End time must be later than start time");
  }

  return {
    start: Timestamp.fromDate(startDate),
    end: Timestamp.fromDate(endDate),
  };
};

const validateBlockDetails = (input: {
  type?: BoardroomBlockType;
  reason?: string;
}): void => {
  if (
    input.type !== undefined &&
    !["maintenance", "unavailable"].includes(input.type)
  ) {
    throw new Error("Invalid boardroom block type");
  }

  if (input.reason !== undefined && !input.reason.trim()) {
    throw new Error("A reason is required");
  }
};

const hasOverlappingBlock = (
  blocks: FirebaseFirestore.QueryDocumentSnapshot[],
  start: Timestamp,
  end: Timestamp,
  excludedBlockId?: string,
): boolean => {
  return blocks.some((doc) => {
    if (doc.id === excludedBlockId) {
      return false;
    }

    const block = doc.data() as BoardroomBlock;

    if (block.status !== "active") {
      return false;
    }

    return (
      block.startAt.toMillis() < end.toMillis() &&
      block.endAt.toMillis() > start.toMillis()
    );
  });
};

// Create Maintenance / Availability Block
export const createBoardroomBlock = async (
  input: CreateBoardroomBlockInput,
): Promise<BoardroomBlock> => {
  validateBlockDetails(input);

  if (!input.boardroomId.trim()) {
    throw new Error("Boardroom ID is required");
  }

  const { start, end } = parseDateRange(input.startAt, input.endAt);

  const boardroomRef = boardroomsCollection.doc(input.boardroomId);
  const blockRef = blocksCollection.doc();
  const now = Timestamp.now();
  const auditLogRef = firestore.collection("audit_logs").doc();

  const block: BoardroomBlock = {
    id: blockRef.id,
    boardroomId: input.boardroomId,
    type: input.type,
    reason: input.reason.trim(),
    startAt: start,
    endAt: end,
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    updatedBy: input.createdBy,
  };

  await firestore.runTransaction(async (transaction) => {
    const boardroomDoc = await transaction.get(boardroomRef);

    if (!boardroomDoc.exists) {
      throw new Error("Boardroom not found");
    }

    const existingBlocks = await transaction.get(
      blocksCollection.where("boardroomId", "==", input.boardroomId),
    );

    if (hasOverlappingBlock(existingBlocks.docs, start, end)) {
      throw new Error(
        "This period overlaps with an existing active boardroom block",
      );
    }

    transaction.create(blockRef, block);
    const admin = input.createdByUser;

    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "boardroom_block.created",
      entityType: "boardroom_block",
      entityId: blockRef.id,
      description: `Created ${block.type} block for boardroom`,
      reason: block.reason,
      metadata: {
        boardroomId: block.boardroomId,
        startAt: block.startAt,
        endAt: block.endAt,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);
  });

  return block;
};

// Get All Blocks for a Boardroom
export const getBoardroomBlocks = async (
  boardroomId: string,
): Promise<BoardroomBlock[]> => {
  const boardroomDoc = await boardroomsCollection.doc(boardroomId).get();

  if (!boardroomDoc.exists) {
    throw new Error("Boardroom not found");
  }

  const snapshot = await blocksCollection
    .where("boardroomId", "==", boardroomId)
    .get();

  return snapshot.docs
    .map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        }) as BoardroomBlock,
    )
    .sort((a, b) => a.startAt.toMillis() - b.startAt.toMillis());
};

// Get a Block by ID
export const getBoardroomBlockById = async (
  blockId: string,
): Promise<BoardroomBlock | null> => {
  const blockDoc = await blocksCollection.doc(blockId).get();

  if (!blockDoc.exists) {
    return null;
  }

  return {
    ...blockDoc.data(),
    id: blockDoc.id,
  } as BoardroomBlock;
};

// Update an Active Block
export const updateBoardroomBlock = async (
  blockId: string,
  updates: UpdateBoardroomBlockInput,
  admin: UserProfile,
): Promise<BoardroomBlock> => {
  validateBlockDetails(updates);

  if (updates.startAt !== undefined && typeof updates.startAt !== "string") {
    throw new Error("Invalid start time");
  }

  if (updates.endAt !== undefined && typeof updates.endAt !== "string") {
    throw new Error("Invalid end time");
  }

  const blockRef = blocksCollection.doc(blockId);

  return firestore.runTransaction(async (transaction) => {
    const blockDoc = await transaction.get(blockRef);

    if (!blockDoc.exists) {
      throw new Error("Boardroom block not found");
    }

    const currentBlock = {
      ...blockDoc.data(),
      id: blockDoc.id,
    } as BoardroomBlock;

    if (currentBlock.status !== "active") {
      throw new Error("Only active boardroom blocks can be updated");
    }

    const boardroomRef = boardroomsCollection.doc(currentBlock.boardroomId);

    const boardroomDoc = await transaction.get(boardroomRef);

    if (!boardroomDoc.exists) {
      throw new Error("Boardroom not found");
    }

    const startAt =
      updates.startAt ?? currentBlock.startAt.toDate().toISOString();
    const endAt = updates.endAt ?? currentBlock.endAt.toDate().toISOString();

    const { start, end } = parseDateRange(startAt, endAt);

    const existingBlocks = await transaction.get(
      blocksCollection.where("boardroomId", "==", currentBlock.boardroomId),
    );

    if (hasOverlappingBlock(existingBlocks.docs, start, end, blockId)) {
      throw new Error(
        "This period overlaps with another active boardroom block",
      );
    }

    const now = Timestamp.now();
    const auditLogRef = firestore.collection("audit_logs").doc();

    const updatedBlock: BoardroomBlock = {
      ...currentBlock,
      type: updates.type ?? currentBlock.type,
      reason: updates.reason?.trim() ?? currentBlock.reason,
      startAt: start,
      endAt: end,
      updatedAt: now,
      updatedBy: admin.uid,
    };

    transaction.update(blockRef, {
      type: updatedBlock.type,
      reason: updatedBlock.reason,
      startAt: updatedBlock.startAt,
      endAt: updatedBlock.endAt,
      updatedAt: now,
      updatedBy: admin.uid,
    });
    const changes: Record<string, unknown> = {};

    if (currentBlock.type !== updatedBlock.type) {
      changes.type = {
        previous: currentBlock.type,
        updated: updatedBlock.type,
      };
    }

    if (currentBlock.reason !== updatedBlock.reason) {
      changes.reason = {
        previous: currentBlock.reason,
        updated: updatedBlock.reason,
      };
    }

    if (currentBlock.startAt.toMillis() !== updatedBlock.startAt.toMillis()) {
      changes.startAt = {
        previous: currentBlock.startAt,
        updated: updatedBlock.startAt,
      };
    }

    if (currentBlock.endAt.toMillis() !== updatedBlock.endAt.toMillis()) {
      changes.endAt = {
        previous: currentBlock.endAt,
        updated: updatedBlock.endAt,
      };
    }

    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "boardroom_block.updated",
      entityType: "boardroom_block",
      entityId: blockId,
      description: "Updated boardroom maintenance/availability block",
      reason: updatedBlock.reason,
      metadata: {
        boardroomId: currentBlock.boardroomId,
        changes,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);

    return updatedBlock;
  });
};

// Cancel a Block
export const cancelBoardroomBlock = async (
  blockId: string,
  admin: UserProfile,
): Promise<BoardroomBlock> => {
  const blockRef = blocksCollection.doc(blockId);

  return firestore.runTransaction(async (transaction) => {
    const blockDoc = await transaction.get(blockRef);

    if (!blockDoc.exists) {
      throw new Error("Boardroom block not found");
    }

    const currentBlock = {
      ...blockDoc.data(),
      id: blockDoc.id,
    } as BoardroomBlock;

    if (currentBlock.status === "cancelled") {
      throw new Error("Boardroom block is already cancelled");
    }

    const now = Timestamp.now();
    const auditLogRef = firestore.collection("audit_logs").doc();

    transaction.update(blockRef, {
      status: "cancelled",
      updatedAt: now,
      updatedBy: admin.uid,
    });
    const auditLog: AuditLog = {
      id: auditLogRef.id,
      actorId: admin.uid,
      actorName: admin.name,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: "boardroom_block.cancelled",
      entityType: "boardroom_block",
      entityId: blockId,
      description: "Cancelled boardroom maintenance/availability block",
      reason: currentBlock.reason,
      metadata: {
        boardroomId: currentBlock.boardroomId,
        previousStatus: currentBlock.status,
      },
      createdAt: now,
    };

    transaction.create(auditLogRef, auditLog);

    return {
      ...currentBlock,
      status: "cancelled",
      updatedAt: now,
      updatedBy: admin.uid,
    };
  });
};
