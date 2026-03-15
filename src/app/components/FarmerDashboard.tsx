import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { api, Crop } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Leaf, LogOut, Plus, Trash2, Edit, CloudSun, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AiAssistant } from "./AiAssistant";
import { ThemeToggle } from "./ThemeToggle";

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
  const { user, logout, updateProfile, changePassword, switchRole } = useAuth();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [weatherLocation, setWeatherLocation] = useState(user?.location || "Nairobi");
  const [weather, setWeather] = useState<{
    location: string;
    current: { temp: number; humidity: number; windSpeed: number; condition: string };
    alerts: Array<{ id: string; type: "drought" | "frost" | "rain" | "storm"; severity: "low" | "medium" | "high"; message: string }>;
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
    const load = async () => {
      try {
        const [cropResponse, weatherResponse] = await Promise.all([
          api.listCrops(),
          api.getWeather(weatherLocation),
        ]);
        setCrops(cropResponse.crops);
        setWeather(weatherResponse);
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
    try {
      const response = await api.getWeather(weatherLocation);
      setWeather(response);
      toast.success("Weather updated");
    } catch (error) {
      toast.error((error as Error).message || "Could not fetch weather");
    }
  };

  const submitCrop = async () => {
    if (!form.name.trim()) {
      toast.error("Crop name is required");
      return;
    }
    if (form.areaSize < 0) {
      toast.error("Area cannot be negative");
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-xl font-semibold">SmithAgro</span>
            <Badge variant="outline">Farmer</Badge>
          </div>
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

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Total Crops</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Growing</p><p className="text-2xl font-bold text-green-600">{stats.growing}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Ready</p><p className="text-2xl font-bold text-yellow-600">{stats.ready}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">Area</p><p className="text-2xl font-bold text-blue-600">{stats.area}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="crops">
          <TabsList>
            <TabsTrigger value="crops">Crops</TabsTrigger>
            <TabsTrigger value="weather">Weather</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

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

          <TabsContent value="weather" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Weather and Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input value={weatherLocation} onChange={(e) => setWeatherLocation(e.target.value)} placeholder="Enter city" />
                  <Button onClick={loadWeather}><CloudSun className="h-4 w-4 mr-2" />Refresh</Button>
                </div>
                {weather && (
                  <>
                    <p className="font-medium">{weather.location}</p>
                    <p className="text-sm">{weather.current.condition} • {weather.current.temp}°C • Humidity {weather.current.humidity}% • Wind {weather.current.windSpeed} km/h</p>
                    <div className="space-y-2">
                      {weather.alerts.length === 0 && <p className="text-sm text-slate-600">No active alerts</p>}
                      {weather.alerts.map((alert) => (
                        <div key={alert.id} className="border rounded-md p-3 bg-amber-50">
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

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Name</Label><Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Username</Label><Input value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Email</Label><Input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} /></div>
                <div className="space-y-1"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} /></div>
                <div className="space-y-1 md:col-span-2"><Label>Location</Label><Input value={profile.location} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} /></div>
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
