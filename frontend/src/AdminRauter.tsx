import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import type { ReactNode } from "react";

const ADMIN_ROLE_ID = "6864af6bdd24a9f129d73d93";

interface Props {
  children: ReactNode;
}

export default function AdminRoute({ children }: Props) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  if (!user || user.roleId !== ADMIN_ROLE_ID) {
    setTimeout(() => {
      toast.error("You do not have access to this website.", { id: "admin-denied" });
    }, 0);
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}