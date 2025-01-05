'use client';

import { useEffect } from 'react';
import Layout from '../components/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Shield, Clock } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const controls = useAnimation();
  const [ref, inView] = useInView();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const handleGetStarted = () => {
    if (user) {
      router.push('/forms');
    } else {
      router.push('/login');
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <motion.div
        className="relative"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -50 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-white -z-10" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                Simplify Your Form Management
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                One secure platform for all your children's activity forms. Save time and stay organized with 1-Form.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleGetStarted}
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-red-100 rounded-lg transform rotate-3 transition-transform duration-300 hover:rotate-0" />
              <img
                src="https://images.pexels.com/photos/434400/pexels-photo-434400.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Smiling Family"
                className="relative rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Additional Image Section 1 */}
      <motion.div
        className="relative py-16 bg-gray-50"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: -50 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-red-100 rounded-lg transform rotate-3 transition-transform duration-300 hover:rotate-0" />
              <img
                src="https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Team Collaboration"
                className="relative rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Collaborate Seamlessly</h2>
              <p className="text-lg text-gray-600">
                Share and manage forms effortlessly. Keep everyone on the same page.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.section
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 50 }
        }}
        transition={{ duration: 0.5 }}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose 1-Form?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ClipboardCheck className="h-8 w-8 text-red-600" />}
              title="Easy Management"
              description="Organize all your forms in one place. Access and update them whenever needed."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-red-600" />}
              title="Secure Storage"
              description="Your data is encrypted and stored securely. Only authorized users can access the information."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-red-600" />}
              title="Save Time"
              description="No more filling out the same information repeatedly. Update once, use everywhere."
            />
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={{ duration: 0.5 }}
        className="py-16 bg-red-50"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of parents who are already using 1-Form to manage their children's activity forms.
          </p>
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleGetStarted}
          >
            Start Using 1-Form <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </motion.section>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 rounded-lg border border-gray-200 hover:border-red-200 transition-colors bg-white hover:shadow-md"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

