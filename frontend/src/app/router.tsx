import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "../features/dashboard/DashboardPage";
import LoginPage from "../features/auth/LoginPage";
import ForgotPasswordPage from "../features/auth/ForgotPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import AppLayout from "../components/layout/AppLayout";
import RoleProtectedRoute from "./RoleProtectedRoute";
import CompanyPage from "../features/companies/CompanyPage";
import BoardroomsPage from "../features/boardrooms/BoardroomsPage";

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            element: <RoleProtectedRoute allowedRoles={["global_admin"]} />,
            children: [
              {
                path: "/companies",
                element: <CompanyPage />,
              },
              {
                path: "/boardrooms",
                element: <BoardroomsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
