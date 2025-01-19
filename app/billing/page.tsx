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
import { Suspense } from 'react';
import BillingContent from './BillingContent';

const planDetails = {
  basic: { name: 'Basic', price: '$0', features: ['Unlimited forms', 'Unlimited joined file rooms', '0 file rooms', 'Email support'] },
  pro: { name: 'Pro', price: '$19', features: ['Everything in Basic', '4 file rooms', '100 total users', 'Email support'] },
  premium: { name: 'Premium', price: '$49', features: ['Everything in Pro', '15 file rooms', '750 total users', 'Priority support'] },
  enterprise: { name: 'Enterprise', price: '$199', features: ['Everything in Premium', 'Unlimited file rooms', 'Unlimited users', 'Priority support'] },
};

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}

