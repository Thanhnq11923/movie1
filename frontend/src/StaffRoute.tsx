import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import type { ReactNode } from "react";

const STAFF_ROLE_ID = "684f84c7a2c60b9b2be5e315"; // Staff role ID from Login.tsx

interface Props {
  children: ReactNode;
}

export default function StaffRoute({ children }: Props) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  if (!user || user.roleId !== STAFF_ROLE_ID) {
    setTimeout(() => {
      toast.error("You do not have access to this website.", { id: "staff-denied" });
    }, 0);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 