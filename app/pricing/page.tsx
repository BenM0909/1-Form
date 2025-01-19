'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

export default function PricingPage() {
  const { user, userPlan } = useAuth();
  const router = useRouter();
  //const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$0',
      features: [
        'Unlimited forms',
        'Unlimited joined file rooms',
        '0 file rooms',
        'Email support',
        'No FormAI Form Uploader',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      features: [
        'Everything in Basic',
        '2 file rooms',
        '250 total users',
        'Email support',
        '1 FormAI Form Upload',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$49',
      features: [
        'Everything in Pro',
        '10 file rooms',
        '750 total users',
        'Priority support',
        'Full access to FormAI Assistant',
        '5 FormAI Form Uploads',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$159',
      features: [
        'Everything in Premium',
        'Unlimited file rooms',
        'Unlimited users',
        'Priority support',
        'Full access to FormAI Assistant',
        'Unlimited FormAI Form Uploads',
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (user) {
      router.push(`/billing?plan=${planId}`);
    } else {
      router.push(`/login?redirect=/billing?plan=${planId}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">Choose Your Plan</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:flex lg:flex-row-reverse">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className={`flex flex-col h-full ${plan.id === userPlan ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-3xl font-bold text-indigo-600">{plan.price}<span className="text-base font-normal text-gray-600">/month</span></p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button
                    className={`w-full ${plan.id === userPlan ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'} transition-colors duration-300`}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={plan.id === userPlan}
                  >
                    {plan.id === userPlan ? '✓ Current Plan' : 'Choose Plan'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

