import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { FarmerDashboard } from "./FarmerDashboard";
import { BuyerDashboard } from "./BuyerDashboard";

export function DashboardRouter() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.userType === "admin") {
      navigate("/admin");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (user.userType === "admin") {
    return null;
  }

  if (user.userType === 'farmer') {
    return <FarmerDashboard />;
  }

  return <BuyerDashboard />;
}
