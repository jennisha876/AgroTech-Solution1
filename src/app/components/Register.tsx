import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Leaf, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { JAMAICA_PARISHES, isJamaicaParish } from "../lib/parishes";
import { SubscriptionModal, SubscriptionLevel } from "./SubscriptionModal";

export function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'farmer' | 'buyer'>('buyer');
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [pendingFarmer, setPendingFarmer] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (location && !isJamaicaParish(location)) {
      toast.error("Please select a valid Jamaica parish");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        email,
        password,
        name,
        username,
        userType,
        location,
        phone,
      });
      if (result.ok) {
        toast.success("Account created successfully!");
        if (userType === 'farmer') {
          setShowSubscription(true);
          setPendingFarmer(true);
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(result.message || "Could not create account. Check email/username and try again.");
      }
    } catch (error) {
      toast.error((error as Error).message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SubscriptionModal
        open={showSubscription}
        onClose={() => {
          setShowSubscription(false);
          if (pendingFarmer) navigate("/dashboard");
        }}
        onSubscribe={async (level: SubscriptionLevel) => {
          setShowSubscription(false);
          try {
            await import("../lib/api").then(({ api }) => api.updateSubscription(level));
            toast.success(`Subscribed to ${level.charAt(0).toUpperCase() + level.slice(1)} plan!`);
          } catch (e) {
            toast.error("Failed to update subscription. Please try again.");
          }
          if (pendingFarmer) navigate("/dashboard");
        }}
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Link to="/" aria-label="Go to homepage">
              <img src="/images/logomain.svg" alt="AgroTechSolution" className="h-12 w-auto" />
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>Join SmithAgro as a farmer or buyer</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label>I am a</Label>
                <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'farmer' | 'buyer')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="farmer" id="farmer" />
                    <Label htmlFor="farmer" className="font-normal cursor-pointer">
                      Farmer - Manage crops and get weather alerts
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buyer" id="buyer" />
                    <Label htmlFor="buyer" className="font-normal cursor-pointer">
                      Buyer - Shop fresh produce from local farms
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johnfarmer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  minLength={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{userType === 'farmer' ? 'Farm Location' : 'Delivery Address'} (Optional)</Label>
                <Select value={location || ""} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select a Jamaica parish" />
                  </SelectTrigger>
                  <SelectContent>
                    {JAMAICA_PARISHES.map((parish) => (
                      <SelectItem key={parish} value={parish}>{parish}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:underline">
                Sign in
              </Link>
            </div>
            <Link to="/" className="text-sm text-center text-muted-foreground hover:underline">
              Back to home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  </>
  );

}

