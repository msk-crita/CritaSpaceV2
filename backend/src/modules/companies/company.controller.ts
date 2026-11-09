import { Request, Response } from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
} from "./company.service";

// Create Company
export const createCompanyController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const { name } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Company name is required",
      });
      return;
    }

    const company = await createCompany(name, req.user);

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create company";

    res.status(message.includes("already exists") ? 409 : 400).json({
      success: false,
      message,
    });
  }
};

// Get All Companies
export const getAllCompaniesController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companies = await getAllCompanies();

    res.status(200).json({
      success: true,
      data: companies,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve companies",
    });
  }
};

// Get Company By ID
export const getCompanyByIdController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companyId = req.params.companyId;

    if (typeof companyId !== "string" || !companyId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
      return;
    }

    const company = await getCompanyById(companyId);

    if (!company) {
      res.status(404).json({
        success: false,
        message: "Company not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve company",
    });
  }
};

// Update Company
export const updateCompanyController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }
    const companyId = req.params.companyId;

    if (typeof companyId !== "string" || !companyId.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
      return;
    }

    const { name, status } = req.body;

    if (
      (name !== undefined && typeof name !== "string") ||
      (status !== undefined && !["active", "inactive"].includes(status))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid company update data",
      });
      return;
    }

    if (name === undefined && status === undefined) {
      res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
      return;
    }

    const company = await updateCompany(
      companyId,
      {
        name,
        status,
      },
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update company";

    const statusCode =
      message === "Company not found"
        ? 404
        : message.includes("already exists")
          ? 409
          : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
