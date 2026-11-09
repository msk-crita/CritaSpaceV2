import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { getAuditLogsController } from "./audit.controller";

const router = Router();

router.use(authenticateUser, authorizeRoles("global_admin"));

router.get("/", getAuditLogsController);

export default router;
