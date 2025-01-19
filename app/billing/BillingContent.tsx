'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../../hooks/useAuth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, CreditCard, Lock } from 'lucide-react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { motion } from 'framer-motion';

const planDetails = {
  basic: { name: 'Basic', price: '$0', features: ['Unlimited forms', 'Unlimited joined file rooms', '0 file rooms', 'Email support'] },
  pro: { name: 'Pro', price: '$19', features: ['Everything in Basic', '4 file rooms', '250 total users', 'Email support'] },
  premium: { name: 'Premium', price: '$49', features: ['Everything in Pro', '15 file rooms', '750 total users', 'Priority support', 'Full access to FormAI'] },
  enterprise: { name: 'Enterprise', price: '$199', features: ['Everything in Premium', 'Unlimited file rooms', 'Unlimited users', 'Priority support', 'Full access to FormAI'] },
};

export default function BillingContent() {
  const { user, userPlan, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan && plan in planDetails) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/billing');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedPlan) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update user's plan in Firestore
      await setDoc(doc(db, 'users', user.uid), { plan: selectedPlan }, { merge: true });

      toast({
        title: "Success",
        description: `Your plan has been updated to ${planDetails[selectedPlan].name}.`,
      });

      router.push('/account');
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user || !selectedPlan) {
    return null; // This will prevent any flickering while redirecting
  }

  return (
    <ProtectedRoute>
    <Layout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
  <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">Update Your Plan</h1>
  <div className="grid md:grid-cols-2 gap-8">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Plan Summary</CardTitle>
          <CardDescription>You are upgrading to the following plan:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{planDetails[selectedPlan].name}</h3>
              <p className="text-3xl font-bold text-indigo-600">{planDetails[selectedPlan].price}<span className="text-base font-normal text-gray-600">/month</span></p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="space-y-2">
                {planDetails[selectedPlan].features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Enter your payment information to complete the upgrade</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <div className="relative">
                <Input id="card-number" placeholder="1234 5678 9012 3456" required />
                <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiration Date</Label>
                <Input id="expiry" placeholder="MM/YY" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Pay ${planDetails[selectedPlan].price} and Upgrade`}
          </Button>
          <p className="text-sm text-gray-500 mt-4 flex items-center justify-center">
            <Lock className="h-4 w-4 mr-1" /> Your payment is secure and encrypted
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  </div>
</div>
    </Layout>
    </ProtectedRoute>
  );
}

