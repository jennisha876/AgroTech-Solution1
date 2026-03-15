import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { SubscriptionModal, SubscriptionLevel, SUBSCRIPTION_DETAILS } from "./SubscriptionModal";
import { api, Crop, Training } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Leaf, LogOut, Plus, Trash2, Edit, CloudSun, Eye, EyeOff, Bell, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { AiAssistant } from "./AiAssistant";
import { ThemeToggle } from "./ThemeToggle";
import { JAMAICA_PARISHES } from "../lib/parishes";

interface Order {
  id: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  deliveryMethod: "delivery" | "pickup";
  address: string;
  deliveryTime?: string;
  paymentMethod?: string;
  orderDate: string;
  buyerName: string;
  buyerEmail: string;
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      unit: string;
    };
    quantity: number;
  }>;
}

const emptyForm = {
  name: "",
  variety: "",
  areaSize: 0,
  plantingDate: "",
  expectedHarvest: "",
  status: "planted" as Crop["status"],
  notes: "",
};

export function FarmerDashboard() {

  const { user, logout, updateProfile, changePassword, switchRole, refreshMe } = useAuth();
  const [showSubscription, setShowSubscription] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("crops");

  const [crops, setCrops] = useState<Crop[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);

  // Training session state
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [booking, setBooking] = useState(false);
  const [trainingType, setTrainingType] = useState<"online" | "on-site">("online");
  const [trainingDate, setTrainingDate] = useState("");

  const [weatherLocation, setWeatherLocation] = useState(user?.location || "Kingston");
  const [weather, setWeather] = useState<{
    location: string;
    current: { temp: number; humidity: number; windSpeed: number; condition: string };
    alerts: Array<{ id: string; type: "drought" | "frost" | "rain" | "storm" | "advisory"; severity: "low" | "medium" | "high"; message: string }>;
  } | null>(null);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    location: user?.location || "",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const hasSelectedMembership = Boolean(user?.subscriptionLevel);
  const isMembershipRequired = user?.userType === "farmer" && !hasSelectedMembership;

  const promptMembershipSelection = () => {
    setShowSubscription(true);
    setUpgrading(true);
  };

  useEffect(() => {
    setProfile({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      location: user?.location || "",
      phone: user?.phone || "",
    });
  }, [user]);

  useEffect(() => {
    if (isMembershipRequired) {
      setActiveTab("account");
      setShowSubscription(true);
      setUpgrading(true);
    }
  }, [isMembershipRequired]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cropResponse, weatherResponse, trainingResponse, orderResponse] = await Promise.all([
          api.listCrops(),
          api.getWeather(weatherLocation),
          api.listTrainings(),
          api.listFarmerOrders(),
        ]);
        setCrops(cropResponse.crops);
        setWeather(weatherResponse);
        setTrainings(trainingResponse.trainings);
        setOrders(orderResponse.orders);
      } catch (error) {
        toast.error((error as Error).message || "Failed loading dashboard data");
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    return {
      total: crops.length,
      growing: crops.filter((c) => c.status === "growing").length,
      ready: crops.filter((c) => c.status === "ready").length,
      area: crops.reduce((acc, c) => acc + Number(c.areaSize || 0), 0),
    };
  }, [crops]);

  const loadWeather = async () => {
    if (isMembershipRequired) {
      toast.error("Choose a membership to access Weather and Alerts.");
      promptMembershipSelection();
      return;
    }

    try {
      const response = await api.getWeather(weatherLocation);
      setWeather(response);
      toast.success("Weather updated");
    } catch (error) {
      toast.error((error as Error).message || "Could not fetch weather");
    }
  };

  // Subscription enforcement logic
  let cropLimit = Infinity;
  let trainingLimit = Infinity;
  let showTechGro = false;
  if (user?.userType === "farmer") {
    switch (user.subscriptionLevel) {
      case "basic":
        cropLimit = 25;
        trainingLimit = 1;
        break;
      case "diamond":
        cropLimit = 50;
        trainingLimit = 3;
        break;
      case "platinum":
        cropLimit = Infinity;
        trainingLimit = Infinity;
        showTechGro = true;
        break;
      default:
        cropLimit = 25;
        trainingLimit = 1;
    }
  }

  // Count this month's training sessions
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const monthlyTrainings = trainings.filter(t => t.date.slice(0, 7) === thisMonth);
  const onlineCount = monthlyTrainings.filter(t => t.type === "online").length;
  const onSiteCount = monthlyTrainings.filter(t => t.type === "on-site").length;
  // Book a training session
  const handleBookTraining = async () => {
    if (isMembershipRequired) {
      toast.error("Choose a membership to book training sessions.");
      promptMembershipSelection();
      return;
    }

    if (!trainingDate) {
      toast.error("Select a date for your training session.");
      return;
    }
    // Enforce limits
    if (user?.subscriptionLevel === "basic" && onlineCount >= 1) {
      toast.error("Basic plan: 1 online training/month. Upgrade for more.");
      setBooking(false);
      promptMembershipSelection();
      return;
    }
    if (user?.subscriptionLevel === "diamond") {
      if (trainingType === "online" && onlineCount >= 2) {
        toast.error("Diamond: 2 online/month. Upgrade for more.");
        setBooking(false);
        promptMembershipSelection();
        return;
      }
      if (trainingType === "on-site" && onSiteCount >= 1) {
        toast.error("Diamond: 1 on-site/month. Upgrade for more.");
        setBooking(false);
        promptMembershipSelection();
        return;
      }
    }
    setBooking(false);
    try {
      const res = await api.createTraining({ type: trainingType, date: trainingDate });
      setTrainings(prev => [res.training, ...prev]);
      toast.success("Training session booked!");
    } catch (e) {
      toast.error("Could not book training session.");
    }
  };

  const submitCrop = async () => {
    if (isMembershipRequired) {
      toast.error("Choose a membership to manage crops.");
      promptMembershipSelection();
      return;
    }

    if (!form.name.trim()) {
      toast.error("Crop name is required");
      return;
    }
    if (form.areaSize < 0) {
      toast.error("Area cannot be negative");
      return;
    }
    if (user?.userType === "farmer" && crops.length >= cropLimit) {
      toast.error("You have reached your crop/customer limit for your subscription. Upgrade to add more.");
      promptMembershipSelection();
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const response = await api.updateCrop(editingId, form);
        setCrops((prev) => prev.map((c) => (c.id === editingId ? response.crop : c)));
        toast.success("Crop updated");
      } else {
        const response = await api.createCrop(form);
        setCrops((prev) => [response.crop, ...prev]);
        toast.success("Crop added");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      toast.error((error as Error).message || "Could not save crop");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (crop: Crop) => {
    setEditingId(crop.id);
    setForm({
      name: crop.name,
      variety: crop.variety,
      areaSize: crop.areaSize,
      plantingDate: crop.plantingDate,
      expectedHarvest: crop.expectedHarvest,
      status: crop.status,
      notes: crop.notes,
    });
  };

  const deleteCrop = async (id: string) => {
    try {
      await api.deleteCrop(id);
      setCrops((prev) => prev.filter((c) => c.id !== id));
      toast.success("Crop deleted");
    } catch (error) {
      toast.error((error as Error).message || "Could not delete crop");
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, "processing");
      setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: "processing" } : o));
      toast.success("Order accepted");
    } catch (error) {
      toast.error((error as Error).message || "Could not accept order");
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, "cancelled");
      setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
      toast.success("Order rejected");
    } catch (error) {
      toast.error((error as Error).message || "Could not reject order");
    }
  };

  const saveProfile = async () => {
    if (profile.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (!profile.email.includes("@")) {
      toast.error("Provide a valid email");
      return;
    }

    const result = await updateProfile(profile);
    if (result.ok) {
      toast.success("Profile updated");
    } else {
      toast.error(result.message || "Could not update profile");
    }
  };

  const savePassword = async () => {
    if (passwords.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    const result = await changePassword(passwords.currentPassword, passwords.newPassword);
    if (result.ok) {
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } else {
      toast.error(result.message || "Could not change password");
    }
  };

  const handleSwitchRole = async () => {
    const result = await switchRole("buyer");
    if (result.ok) {
      toast.success("Switched to buyer account");
      navigate("/dashboard");
    } else {
      toast.error(result.message || "Could not switch role");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logomain.png" alt="SmithAgro" className="h-12 w-auto object-contain" />
            <Badge variant="outline">Farmer</Badge>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <Button variant={activeTab === "crops" ? "default" : "ghost"} onClick={() => setActiveTab("crops")}>Crops</Button>
            <Button variant={activeTab === "orders" ? "default" : "ghost"} onClick={() => setActiveTab("orders")}>Orders</Button>
            <Button variant={activeTab === "trainings" ? "default" : "ghost"} onClick={() => setActiveTab("trainings")}>Training</Button>
            <Button variant={activeTab === "learning" ? "default" : "ghost"} onClick={() => setActiveTab("learning")}>Learning</Button>
            <Button variant={activeTab === "weather" ? "default" : "ghost"} onClick={() => setActiveTab("weather")}>Weather</Button>
            <Button variant={activeTab === "alerts" ? "default" : "ghost"} onClick={() => setActiveTab("alerts")}>Alerts</Button>
            <Button variant={activeTab === "account" ? "default" : "ghost"} onClick={() => setActiveTab("account")}>Account</Button>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.name}</span>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <SubscriptionModal
        open={showSubscription}
        onClose={() => setShowSubscription(false)}
        onSubscribe={async (level: SubscriptionLevel, currency: "usd" | "jmd") => {
          setShowSubscription(false);
          setUpgrading(false);
          // Only require payment if not on trial or upgrading from trial
          if (user?.subscriptionStatus !== "trial" || user?.trialEndsAt && new Date(user.trialEndsAt) < new Date()) {
            // Determine amount
            const plan = SUBSCRIPTION_DETAILS[level];
            let amount = 0;
            if (currency === "usd") {
              amount = plan.priceUSD;
            } else {
              amount = plan.priceJMD;
            }
            if (!amount) {
              toast.error("Could not determine plan price.");
              return;
            }
            try {
              const payment = await api.createPaymentIntent(amount, currency);
              if (payment.status === "mock_success" || payment.status === "succeeded") {
                await api.updateSubscription(level);
                await refreshMe();
                setActiveTab("crops");
                toast.success(`Upgraded to ${level.charAt(0).toUpperCase() + level.slice(1)}! Payment successful.`);
              } else {
                toast.error("Payment failed or requires action. Please try again.");
              }
            } catch (e) {
              toast.error("Payment failed. Please try again.");
            }
          } else {
            // On trial, allow upgrade without payment
            try {
              await api.updateSubscription(level);
              await refreshMe();
              setActiveTab("crops");
              toast.success(`Upgraded to ${level.charAt(0).toUpperCase() + level.slice(1)}!`);
            } catch (e) {
              toast.error("Failed to update subscription. Please try again.");
            }
          }
        }}
      />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Total Crops</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Growing</p><p className="text-2xl font-bold text-green-600">{stats.growing}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Ready</p><p className="text-2xl font-bold text-yellow-600">{stats.ready}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Area</p><p className="text-2xl font-bold text-blue-600">{stats.area}</p></CardContent></Card>
        </div>
        <Tabs
          defaultValue="crops"
          value={activeTab}
          onValueChange={(nextTab) => {
            if (isMembershipRequired && nextTab !== "account") {
              toast.error("Select a membership first to access this section.");
              promptMembershipSelection();
              return;
            }
            setActiveTab(nextTab);
          }}
        >
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Incoming Orders</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.filter(o => o.status === "pending").map((order) => (
                    <div key={order.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Order {order.id} from {order.buyerName}</p>
                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
                      <p className="text-sm">Delivery: {order.deliveryMethod} • {order.address}</p>
                      {order.deliveryTime && <p className="text-sm">Preferred Time: {new Date(order.deliveryTime).toLocaleString()}</p>}
                      {order.paymentMethod && <p className="text-sm">Payment: {order.paymentMethod}</p>}
                      <div className="text-sm mt-2 space-y-1">
                        {order.items.map((item) => (
                          <p key={item.product.id}>{item.quantity} x {item.product.name} (${item.product.price} {item.product.unit})</p>
                        ))}
                      </div>
                      <p className="font-semibold mt-2">Total ${order.total.toFixed(2)}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectOrder(order.id)}>Reject</Button>
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status !== "pending").length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Processed Orders</h3>
                      {orders.filter(o => o.status !== "pending").map((order) => (
                        <div key={order.id} className="border rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Order {order.id} from {order.buyerName}</p>
                            <Badge variant="outline" className="capitalize">{order.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
                          <p className="text-sm">Delivery: {order.deliveryMethod} • {order.address}</p>
                          <p className="font-semibold">Total ${order.total.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="trainings" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Training Sessions</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <span className="font-semibold">This month:</span> {onlineCount} online / {onSiteCount} on-site
                    <span className="ml-2 text-xs text-muted-foreground">(Plan limit: {user?.subscriptionLevel === "basic" ? "1 online" : user?.subscriptionLevel === "diamond" ? "2 online, 1 on-site" : "Unlimited"})</span>
                  </div>
                  <Button onClick={() => setBooking(true)} disabled={user?.subscriptionLevel === "basic" ? onlineCount >= 1 : user?.subscriptionLevel === "diamond" ? (onlineCount >= 2 && trainingType === "online") || (onSiteCount >= 1 && trainingType === "on-site") : false}>
                    Book Training
                  </Button>
                </div>
                {booking && (
                  <div className="mb-4 flex flex-col md:flex-row gap-2 items-end">
                    <Label>Type</Label>
                    <Select value={trainingType} onValueChange={v => setTrainingType(v as "online" | "on-site") }>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="on-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label>Date</Label>
                    <Input type="date" value={trainingDate} onChange={e => setTrainingDate(e.target.value)} className="w-40" />
                    <Button onClick={handleBookTraining} className="bg-green-600 hover:bg-green-700">Confirm</Button>
                    <Button variant="outline" onClick={() => setBooking(false)}>Cancel</Button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left">Date</th>
                        <th className="text-left">Type</th>
                        <th className="text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainings.length === 0 && (
                        <tr><td colSpan={3} className="text-center text-muted-foreground">No training sessions yet.</td></tr>
                      )}
                      {trainings.map(t => (
                        <tr key={t.id}>
                          <td>{t.date}</td>
                          <td className="capitalize">{t.type}</td>
                          <td>{t.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crops" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>{editingId ? "Edit Crop" : "Add Crop"}</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                <Input placeholder="Crop name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Variety" value={form.variety} onChange={(e) => setForm((p) => ({ ...p, variety: e.target.value }))} />
                <Input type="number" placeholder="Area size" value={form.areaSize} onChange={(e) => setForm((p) => ({ ...p, areaSize: Number(e.target.value || 0) }))} />
                <Select value={form.status} onValueChange={(value: Crop["status"]) => setForm((p) => ({ ...p, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planted">Planted</SelectItem>
                    <SelectItem value="growing">Growing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="harvested">Harvested</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={form.plantingDate} onChange={(e) => setForm((p) => ({ ...p, plantingDate: e.target.value }))} />
                <Input type="date" value={form.expectedHarvest} onChange={(e) => setForm((p) => ({ ...p, expectedHarvest: e.target.value }))} />
                <div className="md:col-span-2">
                  <Textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={submitCrop} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {editingId ? "Update Crop" : "Add Crop"}
                  </Button>
                  {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {crops.map((crop) => (
                <Card key={crop.id}>
                  <CardContent className="pt-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{crop.name}</p>
                      <p className="text-sm text-slate-600">{crop.variety} • {crop.areaSize} acres</p>
                      <p className="text-sm text-slate-500">Planting: {crop.plantingDate || "N/A"} • Harvest: {crop.expectedHarvest || "N/A"}</p>
                      {crop.notes && <p className="text-sm mt-2">{crop.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{crop.status}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(crop)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteCrop(crop.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Farming Methods Learning Hub</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4 space-y-2">
                  <p className="font-semibold">Vertical Farming</p>
                  <p className="text-sm text-muted-foreground">Best for limited land and controlled production cycles. Works well for leafy greens and herbs.</p>
                  <p className="text-xs text-muted-foreground">Focus: stacked systems, nutrient dosing, humidity and airflow control.</p>
                </div>
                <div className="border rounded-md p-4 space-y-2">
                  <p className="font-semibold">Traditional Farming</p>
                  <p className="text-sm text-muted-foreground">Good for larger plots and lower setup cost. Depends more on weather and soil preparation.</p>
                  <p className="text-xs text-muted-foreground">Focus: soil testing, crop rotation, irrigation, pest scouting schedule.</p>
                </div>
                <div className="border rounded-md p-4 space-y-2">
                  <p className="font-semibold">Aquaponics</p>
                  <p className="text-sm text-muted-foreground">Combines fish and crops in one recirculating system with high water efficiency.</p>
                  <p className="text-xs text-muted-foreground">Focus: water quality, fish health, biofiltration, steady nutrient balance.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Use TechGro for Guided Learning</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Open TechGro and ask: "Compare vertical farming, traditional farming, and aquaponics for my budget and land size" to get a tailored recommendation.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Weather and Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Select value={weatherLocation} onValueChange={setWeatherLocation}>
                    <SelectTrigger><SelectValue placeholder="Select a Jamaica parish" /></SelectTrigger>
                    <SelectContent>
                      {JAMAICA_PARISHES.map((parish) => (
                        <SelectItem key={parish} value={parish}>{parish}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={loadWeather}><CloudSun className="h-4 w-4 mr-2" />Refresh</Button>
                </div>
                {weather && (
                  <>
                    <p className="font-medium">{weather.location}</p>
                    <p className="text-sm">{weather.current.condition} • {weather.current.temp}°C • Humidity {weather.current.humidity}% • Wind {weather.current.windSpeed} km/h</p>
                    <div className="space-y-2">
                      {weather.alerts.length === 0 && <p className="text-sm text-slate-600">No active alerts</p>}
                      {weather.alerts.map((alert) => (
                        <div key={alert.id} className="border rounded-md p-3 bg-amber-100/30 dark:bg-amber-900/20">
                          <p className="text-sm font-medium capitalize">{alert.type} ({alert.severity})</p>
                          <p className="text-sm">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Farm Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {!weather && <p className="text-sm text-muted-foreground">Load weather first to view current alerts.</p>}
                {weather?.alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-md p-3 bg-amber-100/30 dark:bg-amber-900/20">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium capitalize">{alert.type}</p>
                      <Badge variant="outline" className="capitalize">{alert.severity}</Badge>
                    </div>
                    <p className="text-sm mt-1">{alert.message}</p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  If you see only low-level advisory alerts, it means current weather does not meet severe rain, storm, or drought thresholds.
                </p>
                <Button onClick={loadWeather} variant="outline">Refresh Alerts</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Disease Monitoring With TechGro</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Use TechGro for symptom-based disease checks. Example prompt: "My pepper leaves have black spots and yellow edges. Diagnose and give treatment steps."</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            {user?.userType === "farmer" && (
              <Card>
                <CardHeader><CardTitle>Membership</CardTitle></CardHeader>
                <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="font-semibold">Current Plan: <span className="capitalize">{user.subscriptionLevel || "not selected"}</span> ({user.subscriptionStatus || "pending"})</div>
                    {user.trialEndsAt && (
                      <div className="text-sm text-muted-foreground">Trial ends: {new Date(user.trialEndsAt).toLocaleDateString()}</div>
                    )}
                    {isMembershipRequired && (
                      <div className="text-sm text-amber-600 mt-1">Select any membership to unlock crops, training, learning, weather, and alerts.</div>
                    )}
                  </div>
                  <Button variant="outline" onClick={promptMembershipSelection}>
                    {upgrading ? "Upgrade" : "Manage Subscription"}
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Name</Label><Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Username</Label><Input value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Email</Label><Input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Location</Label>
                  <Select value={profile.location || ""} onValueChange={(value) => setProfile((p) => ({ ...p, location: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select a Jamaica parish" /></SelectTrigger>
                    <SelectContent>
                      {JAMAICA_PARISHES.map((parish) => (
                        <SelectItem key={parish} value={parish}>{parish}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2"><Button onClick={saveProfile} className="bg-green-600 hover:bg-green-700">Save Profile</Button></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                <div className="relative">
                  <Input type={showCurrentPassword ? "text" : "password"} placeholder="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))} />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowCurrentPassword((prev) => !prev)}>
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Input type={showNewPassword ? "text" : "password"} placeholder="New password" value={passwords.newPassword} onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))} />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowNewPassword((prev) => !prev)}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="md:col-span-2"><Button onClick={savePassword}>Update Password</Button></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
              <CardContent>
                <ThemeToggle />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Switch Account Type</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">Use the same profile to switch from farmer to buyer account.</p>
                <Button onClick={handleSwitchRole} variant="outline">Switch to Buyer</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AiAssistant />
    </div>
  );
}
