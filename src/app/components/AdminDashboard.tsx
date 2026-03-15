import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Shield, LogOut } from "lucide-react";
import { toast } from "sonner";

export function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    buyers: 0,
    farmers: 0,
    admins: 0,
    orders: 0,
    reviews: 0,
    pendingResets: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== "admin") {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const response = await api.adminOverview();
        setStats(response);
      } catch (error) {
        toast.error((error as Error).message || "Could not load admin overview");
      }
    };

    load();
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.userType !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-700" />
            <span className="text-xl font-semibold">AgroTechSolution Admin</span>
            <Badge variant="outline">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.users}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Buyers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.buyers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Farmers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.farmers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Admins</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.admins}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Orders</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.orders}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Reviews</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.reviews}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Pending Reset Requests</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.pendingResets}</p></CardContent></Card>
      </div>
    </div>
  );
}
