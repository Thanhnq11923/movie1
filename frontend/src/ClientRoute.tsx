import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import type { ReactNode } from "react";

const ADMIN_ROLE_ID = "6864af6bdd24a9f129d73d93";
const STAFF_ROLE_ID = "684f84c7a2c60b9b2be5e315";

interface Props {
  children: ReactNode;
}

export default function ClientRoute({ children }: Props) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  // Nếu user là admin, redirect về trang admin
  if (user && user.roleId === ADMIN_ROLE_ID) {
    setTimeout(() => {
      toast.error("Admin cannot access client pages. Please use the admin panel.", { 
        id: "admin-client-denied" 
      });
    }, 0);
    return <Navigate to="/admin/home" state={{ from: location }} replace />;
  }

  // Nếu user là staff, redirect về trang staff
  if (user && user.roleId === STAFF_ROLE_ID) {
    setTimeout(() => {
      toast.error("Staff cannot access client pages. Please use the staff panel.", { 
        id: "staff-client-denied" 
      });
    }, 0);
    return <Navigate to="/staff/dashboard" state={{ from: location }} replace />;
  }

  // Cho phép customer hoặc user chưa đăng nhập truy cập
  return <>{children}</>;
} 