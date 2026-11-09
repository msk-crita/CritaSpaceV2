import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { createUser } from "./user.controller";

const router = Router();

router.post("/", authenticateUser, authorizeRoles("global_admin"), createUser);

export default router;
