import { Router } from "express";
import { authenticateUser } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import {
  createCompanyController,
  getAllCompaniesController,
  getCompanyByIdController,
  updateCompanyController,
} from "./company.controller";

const router = Router();

// All company routes require Global Admin authentication
router.use(authenticateUser, authorizeRoles("global_admin"));

// Create company
router.post("/", createCompanyController);

// Get all companies
router.get("/", getAllCompaniesController);

// Get company by ID
router.get("/:companyId", getCompanyByIdController);

// Update company
router.patch("/:companyId", updateCompanyController);

export default router;
