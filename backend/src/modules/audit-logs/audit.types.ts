import { Timestamp } from "firebase-admin/firestore";
import { UserRole } from "../users/user.types";

export type AuditEntityType =
  | "company"
  | "user"
  | "boardroom"
  | "boardroom_block"
  | "booking"
  | "booking_negotiation"
  | "recurring_booking"
  | "booking_rules";

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  description: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Timestamp;
}

export interface CreateAuditLogInput {
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  description: string;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
}
