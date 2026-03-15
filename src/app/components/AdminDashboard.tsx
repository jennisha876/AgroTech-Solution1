import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { Shield, LogOut, Users, UserCheck, UserX, Eye, Edit, Trash2, Check, X, Plus, User, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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

  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "buyer" });

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== "admin") {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        // Mock data for testing
        setStats({
          users: 2,
          buyers: 1,
          farmers: 1,
          admins: 1,
          orders: 1,
          reviews: 2,
          pendingResets: 0,
        });

        setUsers([
          {
            id: "user-1",
            name: "John Farmer",
            email: "john@farmer.com",
            role: "farmer",
            subscription: "basic",
            createdAt: "2026-01-01T00:00:00Z"
          },
          {
            id: "user-2",
            name: "Jane Buyer",
            email: "jane@buyer.com",
            role: "buyer",
            createdAt: "2026-01-02T00:00:00Z"
          }
        ]);

        setOrders([
          {
            id: "order-1",
            total: 45.50,
            status: "pending", // Initially pending, admin can approve
            deliveryMethod: "delivery",
            address: "Kingston, Jamaica",
            deliveryTime: "2026-03-16T14:00",
            paymentMethod: "card",
            orderDate: "2026-03-15T10:30:00Z",
            buyerName: "Test Buyer",
            buyerEmail: "testbuyer@example.com",
            items: [
              {
                product: {
                  id: "prod-1",
                  name: "Fresh Tomatoes",
                  price: 5.00,
                  unit: "lb"
                },
                quantity: 5
              },
              {
                product: {
                  id: "prod-2", 
                  name: "Organic Lettuce",
                  price: 3.50,
                  unit: "lb"
                },
                quantity: 3
              }
            ]
          }
        ]);

        setReviews([
          {
            id: "review-1",
            rating: 5,
            comment: "Excellent quality produce! Will definitely order again.",
            reviewerName: "John Smith",
            reviewerEmail: "john@example.com",
            productId: "prod-1",
            productName: "Fresh Tomatoes",
            createdAt: "2026-03-14T09:00:00Z"
          },
          {
            id: "review-2",
            rating: 4,
            comment: "Good service, but delivery was a bit late.",
            reviewerName: "Jane Doe",
            reviewerEmail: "jane@example.com",
            productId: "prod-2",
            productName: "Organic Lettuce",
            createdAt: "2026-03-13T15:30:00Z"
          }
        ]);
      } catch (error) {
        toast.error((error as Error).message || "Could not load admin data");
      }
    };

    load();
  }, [isAuthenticated, user, navigate]);

  // User management functions
  const handleViewUserProfile = (user: any) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleAddUser = async () => {
    try {
      // Mock add user
      const newUserData = {
        id: `user-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date().toISOString()
      };
      setUsers([...users, newUserData]);
      setNewUser({ name: "", email: "", role: "buyer" });
      setShowAddUser(false);
      toast.success("User added successfully");
    } catch (error) {
      toast.error("Failed to add user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Mock delete user
      setUsers(users.filter(u => u.id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Order management functions
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Mock update order status
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, "approved");
  };

  // Review management functions
  const handleApproveReview = async (reviewId: string) => {
    try {
      // Mock approve review
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, approved: true } : r));
      toast.success("Review approved successfully");
    } catch (error) {
      toast.error("Failed to approve review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      // Mock delete review
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast.success("Review deleted successfully");
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  // Subscription management
  const handleCancelSubscription = async (userId: string) => {
    try {
      // Mock cancel subscription
      setUsers(users.map(u => u.id === userId ? { ...u, subscription: null } : u));
      toast.success("Subscription cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
  };

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Admin Overview</h2>
              <Button onClick={() => setShowAddUser(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("farmers")}>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Total Users</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{stats.users}</p></CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("buyers")}>
                <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" />Buyers</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{stats.buyers}</p></CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("farmers")}>
                <CardHeader><CardTitle className="flex items-center gap-2"><UserX className="h-5 w-5" />Farmers</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{stats.farmers}</p></CardContent>
              </Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Admins</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.admins}</p></CardContent></Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("orders")}>
                <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Orders</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{stats.orders}</p></CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("reviews")}>
                <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />Reviews</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold">{stats.reviews}</p></CardContent>
              </Card>
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
                        <div>
                          <p className="font-medium">Order {order.id} - {order.buyerName}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
                          <p className="text-sm">Total: ${order.total}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewOrderDetails(order)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Select onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        {order.status === "pending" && (
                          <Button size="sm" onClick={() => handleApproveOrder(order.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
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
                        <div>
                          <p className="font-medium">Review for {review.productName} by {review.reviewerName}</p>
                          <Badge variant="outline">{review.rating} Stars</Badge>
                        </div>
                        {review.approved && <Badge variant="default">Approved</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(review.createdAt).toLocaleString()}</p>
                      <div className="flex gap-2 mt-2">
                        {!review.approved && (
                          <Button size="sm" onClick={() => handleApproveReview(review.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Review</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this review? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                  {users.filter(u => u.role === "farmer").map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewUserProfile(user)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        {user.subscription && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <X className="h-4 w-4 mr-1" />
                                Cancel Subscription
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel {user.name}'s subscription? This action cannot be easily undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancelSubscription(user.id)}>
                                  Cancel Subscription
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                  {users.filter(u => u.role === "buyer").map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewUserProfile(user)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Profile Modal */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge variant="outline" className="capitalize">{selectedUser.role}</Badge>
                </div>
                <div>
                  <Label>Joined</Label>
                  <p className="text-sm font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {selectedUser.role === "farmer" && (
                <div>
                  <Label>Subscription Status</Label>
                  <p className="text-sm font-medium">
                    {selectedUser.subscription ? "Active" : "No active subscription"}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserProfile(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected order
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order ID</Label>
                  <p className="text-sm font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant="outline" className="capitalize">{selectedOrder.status}</Badge>
                </div>
                <div>
                  <Label>Buyer</Label>
                  <p className="text-sm font-medium">{selectedOrder.buyerName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedOrder.buyerEmail}</p>
                </div>
                <div>
                  <Label>Order Date</Label>
                  <p className="text-sm font-medium">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Delivery Time</Label>
                  <p className="text-sm font-medium">{new Date(selectedOrder.deliveryTime).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="text-sm font-medium capitalize">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <Label>Delivery Method</Label>
                  <p className="text-sm font-medium capitalize">{selectedOrder.deliveryMethod}</p>
                </div>
              </div>
              <div>
                <Label>Delivery Address</Label>
                <p className="text-sm font-medium">{selectedOrder.address}</p>
              </div>
              <div>
                <Label>Order Items</Label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Unit: {item.product.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.product.price} × {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Total Amount</Label>
                  <p className="text-lg font-bold">${selectedOrder.total}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowOrderDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={!newUser.name || !newUser.email}>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
