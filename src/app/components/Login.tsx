import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User, ShoppingBag, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"farmer" | "buyer" | "admin">("farmer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password, userType);
      if (result.ok) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error(result.message || "Invalid email or password");
      }
    } catch (error) {
      toast.error((error as Error).message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const identifier = window.prompt("Enter your email or username to receive a reset link:")?.trim();
    if (!identifier) {
      return;
    }

    const result = await requestPasswordReset(identifier);
    if (result.ok) {
      if (result.resetToken) {
        toast.success("Reset token created. Continue to reset page.");
        navigate(`/reset-password?token=${encodeURIComponent(result.resetToken)}`);
      } else {
        toast.success("If account exists, reset link was generated.");
      }
    } else {
      toast.error(result.message || "Could not submit password reset request");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/images/logomain.svg" alt="AgroTechSolution" className="h-12 w-auto" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your SmithAgro account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as "farmer" | "buyer" | "admin")} className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="farmer" className="gap-2">
                  <User className="h-4 w-4" />
                  Farmer
                </TabsTrigger>
                <TabsTrigger value="buyer" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Buyer
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>
              <TabsContent value="farmer">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    Login as a farmer to manage your crops and weather alerts
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="buyer">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    Login as a buyer to shop fresh produce from local farms
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="admin">
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    Login as admin to access AgroTechSolution system controls
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
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
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={handlePasswordReset}>
                Forget Password?
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-green-600 hover:underline">
                Sign up
              </Link>
            </div>
            <Link to="/" className="text-sm text-center text-gray-600 hover:underline">
              Back to home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
