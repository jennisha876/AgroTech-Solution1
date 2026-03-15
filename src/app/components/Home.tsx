import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Leaf, TrendingUp, ShoppingCart, Shield, ArrowRight, CloudRain, Truck } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" aria-label="Go to homepage">
              <img src="/images/logomain.png" alt="AgroTechSolution" className="h-9 w-auto" />
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-green-600 hover:bg-green-700">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Show subscription info if logged in as farmer */}
      {user?.userType === 'farmer' && (
        <section className="bg-yellow-50 py-4 border-b">
          <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <span className="font-semibold">Your Plan:</span> <span className="capitalize">{user.subscriptionLevel || 'basic'}</span> ({user.subscriptionStatus || 'trial'})
              {user.trialEndsAt && (
                <span className="ml-2 text-xs text-muted-foreground">Trial ends: {new Date(user.trialEndsAt).toLocaleDateString()}</span>
              )}
            </div>
            <Link to="/dashboard">
              <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700">Manage Subscription</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Connecting Farms to Tables
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                SmithAgro is your complete agricultural marketplace. Farmers get smart crop 
                management and weather insights. Buyers get fresh, quality produce delivered 
                directly from the farm.
              </p>
              <div className="flex gap-4">
                <Link to="/register">
                  <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                    Start Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1650793040134-c9fc936ec9cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBmaWVsZCUyMHN1bnJpc2V8ZW58MXx8fHwxNzczNTEzNjkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Agricultural field at sunrise"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why SmithAgro Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose SmithAgro?</h2>
            <p className="text-xl text-gray-600">
              The only platform you need for modern agriculture and fresh produce
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* For Farmers */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">For Farmers</h3>
              </div>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CloudRain className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Weather Intelligence</CardTitle>
                  </div>
                  <CardDescription>
                    Get real-time weather alerts including drought warnings, frost alerts, 
                    and rainfall predictions to protect your crops and optimize harvests.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">Smart Crop Management</CardTitle>
                  </div>
                  <CardDescription>
                    Track your crops, monitor growth stages, manage planting schedules, 
                    and get insights on best harvest times.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Direct Market Access</CardTitle>
                  </div>
                  <CardDescription>
                    List your produce and sell directly to buyers. No middlemen, better 
                    prices, and complete control over your sales.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* For Buyers */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">For Buyers</h3>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Farm-Fresh Produce</CardTitle>
                  </div>
                  <CardDescription>
                    Shop directly from local farmers. Get the freshest fruits, vegetables, 
                    and crops delivered to your doorstep or available for pickup.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">Easy Delivery & Tracking</CardTitle>
                  </div>
                  <CardDescription>
                    Track your orders in real-time. Choose between convenient home delivery 
                    or farm pickup options.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">Quality Guaranteed</CardTitle>
                  </div>
                  <CardDescription>
                    Every purchase is backed by our quality guarantee. Secure payments 
                    and verified farmers ensure you get the best.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Farmers Flow */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-green-600">For Farmers</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Sign Up & Add Crops</h4>
                    <p className="text-gray-600">
                      Create your farmer account and add your crops with details like variety, 
                      planting date, and expected harvest.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Monitor & Get Alerts</h4>
                    <p className="text-gray-600">
                      Receive weather alerts, drought warnings, and get recommendations 
                      for optimal crop care.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">List & Sell</h4>
                    <p className="text-gray-600">
                      List your harvest for sale and connect directly with buyers looking 
                      for fresh produce.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyers Flow */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-blue-600">For Buyers</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Browse Fresh Produce</h4>
                    <p className="text-gray-600">
                      Explore a wide variety of fresh crops from verified local farmers 
                      in your area.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Add to Cart & Checkout</h4>
                    <p className="text-gray-600">
                      Select your items, add them to cart, and complete your purchase with 
                      secure payment options.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Track & Receive</h4>
                    <p className="text-gray-600">
                      Track your order in real-time and receive fresh produce at your 
                      doorstep or pick up from the farm.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1606836484371-483e90c5d19a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBtYXJrZXR8ZW58MXx8fHwxNzczNTEzNjg5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Fresh vegetables at market"
                className="w-full h-auto"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6">Trusted by Thousands</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join our growing community of farmers and buyers revolutionizing agriculture.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">2,500+</div>
                  <div className="text-gray-600">Active Farmers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
                  <div className="text-gray-600">Happy Buyers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-gray-600">Orders Delivered</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                  <div className="text-gray-600">Fresh Guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-green-100">
            Join SmithAgro today - whether you're a farmer or a buyer, we've got you covered.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Free Account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="h-6 w-6 text-green-400" />
                <span className="font-semibold text-white">SmithAgro</span>
              </div>
              <p className="text-sm">
                Connecting farms to tables with smart technology and fresh produce.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">For Farmers</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Crop Management</a></li>
                <li><a href="#" className="hover:text-white">Weather Alerts</a></li>
                <li><a href="#" className="hover:text-white">Sell Produce</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">For Buyers</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Shop Produce</a></li>
                <li><a href="#" className="hover:text-white">Track Orders</a></li>
                <li><a href="#" className="hover:text-white">Delivery Info</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 SmithAgro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
