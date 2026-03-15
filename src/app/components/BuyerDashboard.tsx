import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { api, Product } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Leaf, LogOut, Search, ShoppingCart, Plus, Minus, Trash2, UserCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { ThemeToggle } from "./ThemeToggle";
import { JAMAICA_PARISHES } from "../lib/parishes";

interface CartItem {
  product: Product;
  quantity: number;
}

interface Order {
  id: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  deliveryMethod: "delivery" | "pickup";
  address: string;
  deliveryTime?: string;
  paymentMethod?: string;
  orderDate: string;
  items: CartItem[];
}

const parishCoordinates: Record<string, [number, number]> = {
  "Kingston": [17.9712, -76.7936],
  "St. Andrew": [18.0179, -76.7608],
  "St. Thomas": [17.9915, -76.4428],
  "Portland": [18.1777, -76.4611],
  "St. Mary": [18.3212, -76.8997],
  "St. Ann": [18.4064, -77.1047],
  "Trelawny": [18.3526, -77.6078],
  "St. James": [18.4166, -77.9260],
  "Hanover": [18.4441, -78.1336],
  "Westmoreland": [18.2944, -78.1564],
  "St. Elizabeth": [18.0512, -77.6994],
  "Manchester": [18.0420, -77.5078],
  "Clarendon": [17.9541, -77.2456],
  "St. Catherine": [17.9894, -77.0768],
};

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function getBuyerCoords(location?: string): [number, number] {
  if (!location) {
    return parishCoordinates["Kingston"];
  }

  const match = Object.keys(parishCoordinates).find((parish) =>
    location.toLowerCase().includes(parish.toLowerCase())
  );

  return match ? parishCoordinates[match] : parishCoordinates["Kingston"];
}

function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateDeliveryTime(distance: number): string {
  // Assume average speed of 30 km/h for delivery
  const timeHours = distance / 30;
  const timeMinutes = Math.round(timeHours * 60);
  if (timeMinutes < 60) {
    return `${timeMinutes} min`;
  }
  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  return `${hours}h ${mins}m`;
}

export function BuyerDashboard() {
  const { user, logout, updateProfile, changePassword, switchRole } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<"shop" | "cart" | "account">("shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.location || "");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "bank" | "cash">("card");
  const [bankAccount, setBankAccount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

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
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<ReturnType<typeof L.map> | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await api.listProducts({
        search,
        category,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
      });
      setProducts(response.products);
    } catch (error) {
      toast.error((error as Error).message || "Failed to load products");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.listOrders();
      setOrders(response.orders);
    } catch (error) {
      toast.error((error as Error).message || "Failed to load orders");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  useEffect(() => {
    setProfile({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      location: user?.location || "",
      phone: user?.phone || "",
    });
  }, [user]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cart]);
  const buyerCoords = getBuyerCoords(deliveryAddress || profile.location || user?.location);

  useEffect(() => {
    if (activeSection !== "cart" || !mapContainerRef.current) {
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current).setView(buyerCoords, 9);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Add buyer marker
    L.marker(buyerCoords, { icon: markerIcon })
      .addTo(map)
      .bindPopup("Your delivery location");

    let maxDistance = 0;
    const routingControls: L.Routing.Control[] = [];
    cart.forEach((item) => {
      const source: [number, number] = [item.product.lat, item.product.lng];
      const distance = calculateDistance(source, buyerCoords);
      maxDistance = Math.max(maxDistance, distance);

      // Add product marker
      L.marker(source, { icon: markerIcon })
        .addTo(map)
        .bindPopup(`${item.product.name} from ${item.product.location}<br>Distance: ${distance.toFixed(1)} km`);

      // Add routing control for route from product to buyer
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(source[0], source[1]),
          L.latLng(buyerCoords[0], buyerCoords[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null, // Don't create additional markers
        lineOptions: {
          styles: [{ color: 'blue', weight: 4, opacity: 0.7 }]
        },
        showAlternatives: true, // Show alternative routes
        altLineOptions: {
          styles: [{ color: 'gray', weight: 3, opacity: 0.5 }]
        }
      }).addTo(map);
      routingControls.push(routingControl);
    });

    // Fit map to show all markers
    if (cart.length > 0) {
      const group = new L.featureGroup([
        L.marker(buyerCoords),
        ...cart.map(item => L.marker([item.product.lat, item.product.lng]))
      ]);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      routingControls.forEach(control => map.removeControl(control));
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeSection, cart, buyerCoords]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success("Added to cart");
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const checkout = async () => {
    if (!cart.length) {
      toast.error("Cart is empty");
      return;
    }
    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) {
      toast.error("Delivery address is required");
      return;
    }

    setPaying(true);
    try {
      const payment = await api.createPaymentIntent(cartTotal);
      const order = await api.createOrder({
        items: cart,
        deliveryMethod,
        address: deliveryMethod === "delivery" ? deliveryAddress : "Pickup",
        deliveryTime: deliveryMethod === "delivery" ? deliveryTime : null,
        paymentMethod,
        payment: paymentMethod === "cash" ? null : {
          status: payment.status,
          paymentIntentId: payment.paymentIntentId,
          provider: payment.provider,
        },
      });

      setOrders((prev) => [order.order, ...prev]);
      setCart([]);
      setActiveSection("cart");
      toast.success("Order placed and payment processed");
    } catch (error) {
      toast.error((error as Error).message || "Checkout failed");
    } finally {
      setPaying(false);
    }
  };

  const saveProfile = async () => {
    const result = await updateProfile(profile);
    if (result.ok) {
      toast.success("Profile updated");
    } else {
      toast.error(result.message || "Could not update profile");
    }
  };

  const savePassword = async () => {
    const result = await changePassword(passwords.currentPassword, passwords.newPassword);
    if (result.ok) {
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success("Password updated");
    } else {
      toast.error(result.message || "Could not update password");
    }
  };

  const handleSwitchRole = async () => {
    const result = await switchRole("farmer");
    if (result.ok) {
      toast.success("Switched to farmer account");
      navigate("/dashboard");
    } else {
      toast.error(result.message || "Could not switch role");
    }
  };

  const submitReview = async (orderId: string, productId: string) => {
    const key = `${orderId}-${productId}`;
    const draft = reviewDrafts[key];
    if (!draft || draft.comment.trim().length < 3) {
      toast.error("Write a short review comment (min 3 chars)");
      return;
    }

    try {
      await api.createReview({
        orderId,
        productId,
        rating: draft.rating || 5,
        comment: draft.comment,
      });
      toast.success("Review submitted");
      setReviewDrafts((prev) => ({ ...prev, [key]: { rating: 5, comment: "" } }));
    } catch (error) {
      toast.error((error as Error).message || "Could not submit review");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logomain.png" alt="SmithAgro" className="h-12 w-auto object-contain" />
            <Badge variant="outline">Buyer</Badge>
          </div>

          <div className="w-full md:max-w-md relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-9"
              placeholder="Search by product, farmer, or parish"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchProducts();
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant={activeSection === "shop" ? "default" : "outline"} onClick={() => setActiveSection("shop")}>Shop</Button>
            <Button variant={activeSection === "cart" ? "default" : "outline"} onClick={() => setActiveSection("cart")}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({cartCount})
            </Button>
            <Button variant={activeSection === "account" ? "default" : "outline"} onClick={() => setActiveSection("account")}>
              <UserCircle className="h-4 w-4 mr-2" />
              Account
            </Button>
            <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-4">
        {activeSection === "shop" && (
          <>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="grid md:grid-cols-4 gap-3">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="grains">Grains</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  <Input type="number" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  <Button onClick={fetchProducts}>Apply Filters</Button>
                </div>
                <p className="text-sm text-muted-foreground">Parish search is enabled for all parishes. Example: St. Thomas, Portland, Clarendon, Kingston.</p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square bg-slate-100">
                    <ImageWithFallback src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-sm text-muted-foreground">{product.farmer} • {product.location}</p>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <p className="font-semibold text-green-700">${product.price} {product.unit}</p>
                    <Button className="w-full mt-2" onClick={() => addToCart(product)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {activeSection === "cart" && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <Card>
                <CardHeader><CardTitle>Current Cart Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {!cart.length && <p className="text-sm text-muted-foreground">Your cart is empty.</p>}
                  {cart.map((item) => (
                    <div key={item.product.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">From {item.product.farmer} in {item.product.location}</p>
                          <p className="text-sm text-muted-foreground">Unit: ${item.product.price} {item.product.unit}</p>
                          <p className="text-sm font-medium">Line total: ${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => updateQty(item.product.id, -1)}><Minus className="h-4 w-4" /></Button>
                          <span>{item.quantity}</span>
                          <Button variant="outline" size="icon" onClick={() => updateQty(item.product.id, 1)}><Plus className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Delivery Tracking Map</CardTitle></CardHeader>
                <CardContent>
                  <div ref={mapContainerRef} className="h-80 rounded-md overflow-hidden border" />
                  <p className="text-xs text-muted-foreground mt-2">Map shows where each product in your cart is sourced from.</p>
                </CardContent>
              </Card>

              {cart.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Delivery Estimate</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cart.map((item) => {
                        const distance = calculateDistance([item.product.lat, item.product.lng], buyerCoords);
                        return (
                          <div key={item.product.id} className="flex justify-between text-sm">
                            <span>{item.product.name} from {item.product.location}</span>
                            <span>{distance.toFixed(1)} km • {estimateDeliveryTime(distance)}</span>
                          </div>
                        );
                      })}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Estimated Delivery Time</span>
                          <span>{estimateDeliveryTime(Math.max(...cart.map(item => calculateDistance([item.product.lat, item.product.lng], buyerCoords))))}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle>Recent Orders (After Purchase)</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {!orders.length && <p className="text-sm text-muted-foreground">No orders yet.</p>}
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Order {order.id}</p>
                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
                      <p className="text-sm">Delivery: {order.deliveryMethod} • {order.address}</p>
                      {order.deliveryTime && <p className="text-sm">Preferred Time: {new Date(order.deliveryTime).toLocaleString()}</p>}
                      {order.paymentMethod && <p className="text-sm">Payment: {order.paymentMethod}</p>}
                      <div className="text-sm mt-2 space-y-1">
                        {order.items.map((item) => (
                          <div key={`${order.id}-${item.product.id}`} className="border rounded p-2">
                            <p>{item.quantity} x {item.product.name} ({item.product.location})</p>
                            <div className="grid md:grid-cols-3 gap-2 mt-2">
                              <Select
                                value={String(reviewDrafts[`${order.id}-${item.product.id}`]?.rating || 5)}
                                onValueChange={(value) => {
                                  const key = `${order.id}-${item.product.id}`;
                                  setReviewDrafts((prev) => ({
                                    ...prev,
                                    [key]: {
                                      rating: Number(value),
                                      comment: prev[key]?.comment || "",
                                    },
                                  }));
                                }}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 Star</SelectItem>
                                  <SelectItem value="2">2 Stars</SelectItem>
                                  <SelectItem value="3">3 Stars</SelectItem>
                                  <SelectItem value="4">4 Stars</SelectItem>
                                  <SelectItem value="5">5 Stars</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                className="md:col-span-2"
                                placeholder="Leave a review"
                                value={reviewDrafts[`${order.id}-${item.product.id}`]?.comment || ""}
                                onChange={(e) => {
                                  const key = `${order.id}-${item.product.id}`;
                                  setReviewDrafts((prev) => ({
                                    ...prev,
                                    [key]: {
                                      rating: prev[key]?.rating || 5,
                                      comment: e.target.value,
                                    },
                                  }));
                                }}
                              />
                            </div>
                            <Button className="mt-2" size="sm" onClick={() => submitReview(order.id, item.product.id)}>Submit Review</Button>
                          </div>
                        ))}
                      </div>
                      <p className="font-semibold mt-2">Total ${Number(order.total).toFixed(2)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Checkout</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p>Total: <span className="font-semibold">${cartTotal.toFixed(2)}</span></p>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={(value: "card" | "paypal" | "bank" | "cash") => setPaymentMethod(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentMethod === "card" && (
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                      </div>
                      <div>
                        <Label>CVV</Label>
                        <Input placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
                {paymentMethod === "bank" && (
                  <div className="space-y-2">
                    <Label>Bank Account Number</Label>
                    <Input placeholder="Enter your bank account number" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                  </div>
                )}
                {paymentMethod === "paypal" && (
                  <div className="space-y-2">
                    <Label>PayPal Email</Label>
                    <Input type="email" placeholder="Enter your PayPal email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Delivery Method</Label>
                  <Select value={deliveryMethod} onValueChange={(value: "delivery" | "pickup") => setDeliveryMethod(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {deliveryMethod === "delivery" && (
                  <>
                    <div className="space-y-2">
                      <Label>Delivery Address</Label>
                      <Input placeholder="Delivery address or parish" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Delivery Time</Label>
                      <Input type="datetime-local" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
                    </div>
                  </>
                )}
                <Button onClick={checkout} disabled={paying || !cart.length || (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv)) || (paymentMethod === "bank" && !bankAccount) || (paymentMethod === "paypal" && !paypalEmail) || (deliveryMethod === "delivery" && !deliveryAddress)} className="w-full bg-green-600 hover:bg-green-700">
                  {paying ? "Processing..." : "Pay and Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "account" && (
          <div className="space-y-4">
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
                <p className="text-sm text-muted-foreground mb-3">Use the same profile to switch from buyer to farmer account.</p>
                <Button onClick={handleSwitchRole} variant="outline">Switch to Farmer</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
