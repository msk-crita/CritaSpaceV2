import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/health.routes";

import userRoutes from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import companyRoutes from "./modules/companies/company.routes";
import boardroomRoutes from "./modules/boardrooms/boardroom.routes";
import boardroomMaintenanceRoutes from "./modules/boardrooms/boardroom-maintenance.routes";
import bookingRulesRoutes from "./modules/bookings/booking-rules.routes";
import availabilityRoutes from "./modules/bookings/availability.routes";
import bookingRoutes from "./modules/bookings/booking.routes";
import bookingNegotiationRoutes from "./modules/bookings/booking-negotiation.routes";
import recurringBookingRoutes from "./modules/bookings/recurring-booking.routes";
import auditRoutes from "./modules/audit-logs/audit.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/api/health", healthRoutes);

app.use("/api/admin/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/booking-negotiations", bookingNegotiationRoutes);
app.use("/api/recurring-bookings", recurringBookingRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/admin/companies", companyRoutes);
app.use("/api/admin/boardrooms", boardroomRoutes);
app.use("/api/admin/boardroom-blocks", boardroomMaintenanceRoutes);
app.use("/api/admin/booking-rules", bookingRulesRoutes);
app.use("/api/admin/audit-logs", auditRoutes);

export default app;
