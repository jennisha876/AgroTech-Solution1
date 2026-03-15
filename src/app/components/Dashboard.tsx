import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Sprout, Plus, Trash2, Edit, LogOut, BarChart3, Beef, Building2, Users, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Livestock {
  id: string;
  tagNumber: string;
  type: "cattle" | "sheep" | "goat" | "poultry" | "pig";
  breed: string;
  age: number;
  weight: number;
  healthStatus: "healthy" | "sick" | "recovering";
  notes: string;
  createdAt: number;
  userId: string;
}

interface Company {
  id: string;
  name: string;
  type: "buyer" | "supplier" | "processor" | "veterinary";
  description: string;
  location: string;
  contactEmail: string;
  createdAt: number;
}

export function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLivestockDialogOpen, setIsLivestockDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [editingLivestock, setEditingLivestock] = useState<Livestock | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [livestockForm, setLivestockForm] = useState({
    tagNumber: "",
    type: "cattle" as Livestock["type"],
    breed: "",
    age: 0,
    weight: 0,
    healthStatus: "healthy" as Livestock["healthStatus"],
    notes: "",
  });
  const [companyForm, setCompanyForm] = useState({
    name: "",
    type: "buyer" as Company["type"],
    description: "",
    location: "",
    contactEmail: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load data from localStorage
  useEffect(() => {
    if (user?.userType === 'farmer') {
      const storedLivestock = localStorage.getItem(`livestock_${user.id}`);
      if (storedLivestock) {
        setLivestock(JSON.parse(storedLivestock));
      }
    }

    // Load all companies for farmers to browse
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) {
      setCompanies(JSON.parse(storedCompanies));
    }
  }, [user]);

  // Save livestock to localStorage
  const saveLivestock = (newLivestock: Livestock[]) => {
    if (user) {
      localStorage.setItem(`livestock_${user.id}`, JSON.stringify(newLivestock));
      setLivestock(newLivestock);
    }
  };

  // Save companies to localStorage
  const saveCompanies = (newCompanies: Company[]) => {
    localStorage.setItem('companies', JSON.stringify(newCompanies));
    setCompanies(newCompanies);
  };

  const handleCreateLivestock = () => {
    if (!livestockForm.tagNumber.trim()) {
      toast.error("Tag number is required");
      return;
    }

    const newLivestock: Livestock = {
      id: Date.now().toString(),
      tagNumber: livestockForm.tagNumber,
      type: livestockForm.type,
      breed: livestockForm.breed,
      age: livestockForm.age,
      weight: livestockForm.weight,
      healthStatus: livestockForm.healthStatus,
      notes: livestockForm.notes,
      createdAt: Date.now(),
      userId: user!.id,
    };

    saveLivestock([...livestock, newLivestock]);
    toast.success("Livestock added successfully");
    resetLivestockForm();
    setIsLivestockDialogOpen(false);
  };

  const handleUpdateLivestock = () => {
    if (!livestockForm.tagNumber.trim() || !editingLivestock) {
      toast.error("Tag number is required");
      return;
    }

    const updatedLivestock = livestock.map((animal) =>
      animal.id === editingLivestock.id
        ? { ...animal, ...livestockForm }
        : animal
    );

    saveLivestock(updatedLivestock);
    toast.success("Livestock updated successfully");
    resetLivestockForm();
    setEditingLivestock(null);
    setIsLivestockDialogOpen(false);
  };

  const handleDeleteLivestock = (livestockId: string) => {
    const updatedLivestock = livestock.filter((animal) => animal.id !== livestockId);
    saveLivestock(updatedLivestock);
    toast.success("Livestock removed successfully");
  };

  const handleCreateCompany = () => {
    if (!companyForm.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    const newCompany: Company = {
      id: Date.now().toString(),
      name: companyForm.name,
      type: companyForm.type,
      description: companyForm.description,
      location: companyForm.location,
      contactEmail: companyForm.contactEmail,
      createdAt: Date.now(),
    };

    const allCompanies = [...companies, newCompany];
    saveCompanies(allCompanies);
    toast.success("Company listing created successfully");
    resetCompanyForm();
    setIsCompanyDialogOpen(false);
  };

  const handleUpdateCompany = () => {
    if (!companyForm.name.trim() || !editingCompany) {
      toast.error("Company name is required");
      return;
    }

    const updatedCompanies = companies.map((company) =>
      company.id === editingCompany.id
        ? { ...company, ...companyForm }
        : company
    );

    saveCompanies(updatedCompanies);
    toast.success("Company listing updated successfully");
    resetCompanyForm();
    setEditingCompany(null);
    setIsCompanyDialogOpen(false);
  };

  const handleDeleteCompany = (companyId: string) => {
    const updatedCompanies = companies.filter((company) => company.id !== companyId);
    saveCompanies(updatedCompanies);
    toast.success("Company listing removed successfully");
  };

  const openEditLivestockDialog = (animal: Livestock) => {
    setEditingLivestock(animal);
    setLivestockForm({
      tagNumber: animal.tagNumber,
      type: animal.type,
      breed: animal.breed,
      age: animal.age,
      weight: animal.weight,
      healthStatus: animal.healthStatus,
      notes: animal.notes,
    });
    setIsLivestockDialogOpen(true);
  };

  const openEditCompanyDialog = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      type: company.type,
      description: company.description,
      location: company.location,
      contactEmail: company.contactEmail,
    });
    setIsCompanyDialogOpen(true);
  };

  const resetLivestockForm = () => {
    setLivestockForm({
      tagNumber: "",
      type: "cattle",
      breed: "",
      age: 0,
      weight: 0,
      healthStatus: "healthy",
      notes: "",
    });
    setEditingLivestock(null);
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      name: "",
      type: "buyer",
      description: "",
      location: "",
      contactEmail: "",
    });
    setEditingCompany(null);
  };

  const handleLivestockDialogClose = () => {
    setIsLivestockDialogOpen(false);
    resetLivestockForm();
  };

  const handleCompanyDialogClose = () => {
    setIsCompanyDialogOpen(false);
    resetCompanyForm();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleContactCompany = (company: Company) => {
    toast.success(`Contact request sent to ${company.name}`);
  };

  const getHealthStatusColor = (status: Livestock["healthStatus"]) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "recovering":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "sick":
        return "bg-red-100 text-red-800 hover:bg-red-100";
    }
  };

  const getCompanyTypeColor = (type: Company["type"]) => {
    switch (type) {
      case "buyer":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "supplier":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "processor":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "veterinary":
        return "bg-green-100 text-green-800 hover:bg-green-100";
    }
  };

  const stats = user?.userType === 'farmer' 
    ? {
        total: livestock.length,
        healthy: livestock.filter(a => a.healthStatus === "healthy").length,
        sick: livestock.filter(a => a.healthStatus === "sick").length,
        companies: companies.length,
      }
    : {
        farmers: 0, // In real app, would count connected farmers
        listings: companies.length,
        connections: 0,
        total: companies.length,
      };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <span className="text-xl font-semibold">Agrotech</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <Badge variant="outline" className="mr-2">
                  {user.userType === 'farmer' ? 'Farmer' : 'Company'}
                </Badge>
                <span className="text-gray-600">Welcome, </span>
                <span className="font-semibold">{user.name}</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Show subscription info if farmer */}
      {user.userType === 'farmer' && (
        <section className="bg-yellow-50 py-4 border-b">
          <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <span className="font-semibold">Your Plan:</span> <span className="capitalize">{user.subscriptionLevel || 'basic'}</span> ({user.subscriptionStatus || 'trial'})
              {user.trialEndsAt && (
                <span className="ml-2 text-xs text-muted-foreground">Trial ends: {new Date(user.trialEndsAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {user.userType === 'farmer' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Livestock</CardTitle>
                <Beef className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Healthy</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.healthy}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Need Attention</CardTitle>
                <Beef className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.sick}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Companies</CardTitle>
                <Building2 className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.companies}</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
                <Building2 className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Farmers</CardTitle>
                <Users className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.farmers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Connections</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.connections}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Messages</CardTitle>
                <Mail className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">0</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue={user.userType === 'farmer' ? 'livestock' : 'companies'} className="space-y-4">
          <TabsList>
            {user.userType === 'farmer' && (
              <>
                <TabsTrigger value="livestock">My Livestock</TabsTrigger>
                <TabsTrigger value="companies">Browse Companies</TabsTrigger>
              </>
            )}
            {user.userType === 'company' && (
              <>
                <TabsTrigger value="companies">My Listings</TabsTrigger>
                <TabsTrigger value="farmers">Browse Farmers</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Livestock Tab (Farmers only) */}
          {user.userType === 'farmer' && (
            <TabsContent value="livestock" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Livestock Inventory</h2>
                <Dialog open={isLivestockDialogOpen} onOpenChange={handleLivestockDialogClose}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsLivestockDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Livestock
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingLivestock ? "Edit Livestock" : "Add New Livestock"}</DialogTitle>
                      <DialogDescription>
                        {editingLivestock ? "Update livestock details" : "Add a new animal to your inventory"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tagNumber">Tag Number *</Label>
                        <Input
                          id="tagNumber"
                          placeholder="e.g., A-001"
                          value={livestockForm.tagNumber}
                          onChange={(e) => setLivestockForm({ ...livestockForm, tagNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Type *</Label>
                        <Select
                          value={livestockForm.type}
                          onValueChange={(value: Livestock["type"]) =>
                            setLivestockForm({ ...livestockForm, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cattle">Cattle</SelectItem>
                            <SelectItem value="sheep">Sheep</SelectItem>
                            <SelectItem value="goat">Goat</SelectItem>
                            <SelectItem value="poultry">Poultry</SelectItem>
                            <SelectItem value="pig">Pig</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="breed">Breed</Label>
                        <Input
                          id="breed"
                          placeholder="e.g., Holstein"
                          value={livestockForm.breed}
                          onChange={(e) => setLivestockForm({ ...livestockForm, breed: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age">Age (months)</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="0"
                          value={livestockForm.age}
                          onChange={(e) => setLivestockForm({ ...livestockForm, age: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="0"
                          value={livestockForm.weight}
                          onChange={(e) => setLivestockForm({ ...livestockForm, weight: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="healthStatus">Health Status</Label>
                        <Select
                          value={livestockForm.healthStatus}
                          onValueChange={(value: Livestock["healthStatus"]) =>
                            setLivestockForm({ ...livestockForm, healthStatus: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="healthy">Healthy</SelectItem>
                            <SelectItem value="recovering">Recovering</SelectItem>
                            <SelectItem value="sick">Sick</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Additional notes..."
                          value={livestockForm.notes}
                          onChange={(e) => setLivestockForm({ ...livestockForm, notes: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleLivestockDialogClose}>
                        Cancel
                      </Button>
                      <Button onClick={editingLivestock ? handleUpdateLivestock : handleCreateLivestock} className="bg-green-600 hover:bg-green-700">
                        {editingLivestock ? "Update" : "Add"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {livestock.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Beef className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">No livestock yet</p>
                    <p className="text-sm text-gray-400">Add your first animal to start tracking</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {livestock.map((animal) => (
                    <Card key={animal.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg">Tag: {animal.tagNumber}</CardTitle>
                              <Badge variant="outline">{animal.type.charAt(0).toUpperCase() + animal.type.slice(1)}</Badge>
                            </div>
                            <CardDescription>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                {animal.breed && <div className="text-sm"><span className="font-medium">Breed:</span> {animal.breed}</div>}
                                <div className="text-sm"><span className="font-medium">Age:</span> {animal.age} months</div>
                                <div className="text-sm"><span className="font-medium">Weight:</span> {animal.weight} kg</div>
                              </div>
                              {animal.notes && <p className="mt-2 text-sm">{animal.notes}</p>}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => openEditLivestockDialog(animal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteLivestock(animal.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Badge className={getHealthStatusColor(animal.healthStatus)}>
                            {animal.healthStatus.charAt(0).toUpperCase() + animal.healthStatus.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {user.userType === 'farmer' ? 'Browse Companies' : 'My Company Listings'}
              </h2>
              {user.userType === 'company' && (
                <Dialog open={isCompanyDialogOpen} onOpenChange={handleCompanyDialogClose}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsCompanyDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Listing
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCompany ? "Edit Listing" : "Create New Listing"}</DialogTitle>
                      <DialogDescription>
                        {editingCompany ? "Update your company listing" : "Create a new company listing"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          placeholder="e.g., AgriCorp Ltd."
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyType">Type</Label>
                        <Select
                          value={companyForm.type}
                          onValueChange={(value: Company["type"]) =>
                            setCompanyForm({ ...companyForm, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="supplier">Supplier</SelectItem>
                            <SelectItem value="processor">Processor</SelectItem>
                            <SelectItem value="veterinary">Veterinary Services</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyLocation">Location</Label>
                        <Input
                          id="companyLocation"
                          placeholder="City, State"
                          value={companyForm.location}
                          onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyEmail">Contact Email</Label>
                        <Input
                          id="companyEmail"
                          type="email"
                          placeholder="contact@company.com"
                          value={companyForm.contactEmail}
                          onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyDescription">Description</Label>
                        <Textarea
                          id="companyDescription"
                          placeholder="What services or products do you offer?"
                          value={companyForm.description}
                          onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleCompanyDialogClose}>
                        Cancel
                      </Button>
                      <Button onClick={editingCompany ? handleUpdateCompany : handleCreateCompany} className="bg-green-600 hover:bg-green-700">
                        {editingCompany ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {companies.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">No companies listed yet</p>
                  <p className="text-sm text-gray-400">
                    {user.userType === 'company' 
                      ? 'Create your first listing to connect with farmers'
                      : 'Check back later for company listings'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {companies.map((company) => (
                  <Card key={company.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="h-5 w-5 text-green-600" />
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            <Badge className={getCompanyTypeColor(company.type)}>
                              {company.type.charAt(0).toUpperCase() + company.type.slice(1)}
                            </Badge>
                          </div>
                          <CardDescription>
                            {company.description && <p className="mb-2">{company.description}</p>}
                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                              {company.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {company.location}
                                </div>
                              )}
                              {company.contactEmail && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4" />
                                  {company.contactEmail}
                                </div>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {user.userType === 'farmer' ? (
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleContactCompany(company)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => openEditCompanyDialog(company)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Farmers Tab (Companies only) */}
          {user.userType === 'company' && (
            <TabsContent value="farmers" className="space-y-4">
              <h2 className="text-2xl font-bold">Browse Farmers</h2>
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Farmer directory coming soon</p>
                  <p className="text-sm text-gray-400">Connect with farmers and grow your network</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
