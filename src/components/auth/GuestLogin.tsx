
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GuestLogin = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up new guest user
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: name,
              role: 'guest'
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) throw signUpError;

        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      } else {
        // Sign in existing guest
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      // Provide more specific error messages based on the error code
      if (error.message.includes("Email address") && error.message.includes("invalid")) {
        toast({
          title: "Email Error",
          description: "The email address format is not accepted. Please use a different email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create Guest Account' : 'Sign In as Guest'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create an account to join tables and respond to prompts' 
              : 'Welcome back! Sign in to continue'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required={isSignUp}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <p className="text-xs text-muted-foreground">
              Use a valid email format (e.g. user@example.com)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex w-full space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={onBack}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default GuestLogin;
