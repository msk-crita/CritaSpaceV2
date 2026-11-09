import { firestore } from "../../config/firebase";
import { Timestamp } from "firebase-admin/firestore";
import { AuditLog, CreateAuditLogInput } from "./audit.types";

const auditLogsCollection = firestore.collection("audit_logs");

export const createAuditLog = async (
  input: CreateAuditLogInput,
): Promise<AuditLog> => {
  const auditLogRef = auditLogsCollection.doc();

  const auditLog: AuditLog = {
    id: auditLogRef.id,
    ...input,
    reason: input.reason ?? null,
    metadata: input.metadata ?? null,
    createdAt: Timestamp.now(),
  };

  await auditLogRef.set(auditLog);

  return auditLog;
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const snapshot = await auditLogsCollection.orderBy("createdAt", "desc").get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Omit<AuditLog, "id">),
    id: doc.id,
  }));
};
