import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Shield, LogOut, Users, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== "admin") {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        const response = await api.adminOverview();
        setStats(response);
        const usersResponse = await api.adminListUsers();
        setUsers(usersResponse.users);
        const ordersResponse = await api.adminListOrders();
        setOrders(ordersResponse.orders);
        const reviewsResponse = await api.adminListReviews();
        setReviews(reviewsResponse.reviews);
      } catch (error) {
        toast.error((error as Error).message || "Could not load admin data");
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
            <img src="/images/logomain.png" alt="AgroTechSolution" className="h-12 w-auto object-contain" />
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

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-4">
              <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.users}</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Buyers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.buyers}</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Farmers</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.farmers}</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Admins</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.admins}</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Orders</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.orders}</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Reviews</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.reviews}</p></CardContent></Card>
              <Card><CardHeader><CardTitle>Pending Reset Requests</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.pendingResets}</p></CardContent></Card>
            </div>
          </TabsContent>
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle>Manage Orders</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Order {order.id} - {order.buyerName}</p>
                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
                      <p className="text-sm">Total: ${order.total}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Update Status</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews">
            <Card>
              <CardHeader><CardTitle>Manage Reviews</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Review for {review.productName} by {review.buyerName}</p>
                        <Badge variant="outline">{review.rating} Stars</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">Approve</Button>
                        <Button size="sm" variant="destructive">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="farmers">
            <Card>
              <CardHeader><CardTitle>Manage Farmers</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.filter(u => u.userType === "farmer").map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{user.name} ({user.username})</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="destructive">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="buyers">
            <Card>
              <CardHeader><CardTitle>Manage Buyers</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.filter(u => u.userType === "buyer").map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{user.name} ({user.username})</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="destructive">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
