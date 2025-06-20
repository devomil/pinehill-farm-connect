
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Login page - isAuthenticated:", isAuthenticated);
    console.log("Login page - currentUser:", currentUser);
    
    if (isAuthenticated && currentUser) {
      console.log("User authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", email);
      const success = await login(email, password);
      console.log("Login attempt result:", success);
      
      if (success) {
        console.log("Login success, redirecting to dashboard");
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        console.log("Login failed");
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && currentUser) {
    console.log("Already authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10" 
           style={{backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2948&q=80')`}}>
      </div>
      
      <Card className="w-full max-w-md z-10 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <img 
              src="/lovable-uploads/010a26d1-93ce-48fa-a2f9-ffa39636566d.png" 
              alt="Pine Hill Farm Logo" 
              className="w-48 h-24 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Pine Hill Farm Connect</CardTitle>
          <CardDescription>Enter your credentials to access the intranet</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@pinehillfarm.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>

        <div className="px-8 pb-6 pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Demo accounts: admin@pinehillfarm.co or ryan@pinehillfarm.co (password: password)
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
