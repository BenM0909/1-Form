'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Clock } from 'lucide-react';
import Header from '../components/header';
import { PricingTable } from '../components/PricingTable';
import FeatureCard from '../components/FeatureCard';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push('/forms');
    } else {
      router.push('/login');
    }
  };

  const features = [
    { icon: Zap, title: "Lightning Fast", description: "Create and manage forms in seconds, not hours." },
    { icon: Shield, title: "Secure by Design", description: "Your data is encrypted and protected at every step." },
    { icon: Clock, title: "Time-Saving", description: "Automate repetitive tasks and focus on what matters." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <Header />
      <HeroSection onGetStarted={handleGetStarted} />
      <FeaturesSection features={features} />
      <PricingSection onGetStarted={handleGetStarted} />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection onGetStarted={handleGetStarted} />
    </div>
  );
}

function HeroSection({ onGetStarted }) {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
            Simplify Your Forms
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your organization's paperwork with our intuitive form management platform.
          </p>
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300"
            onClick={onGetStarted}
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>
    </section>
  );
}

function FeaturesSection({ features }) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose 1-Form?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { title: "Create", description: "Design custom forms tailored to your needs." },
    { title: "Share", description: "Distribute forms securely to your audience." },
    { title: "Analyze", description: "Gain insights from collected data effortlessly." },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-center md:space-x-8">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ title, description, index }) {
  return (
    <div className="text-center mb-8 md:mb-0">
      <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {index + 1}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { quote: "1-Form has transformed how we handle paperwork. It's a game-changer!", author: "Sarah J.", role: "School Administrator" },
    { quote: "As a busy parent, 1-Form saves me so much time. No more lost forms!", author: "Michael C.", role: "Parent" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg">
      <div className="mb-4">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
      </div>
      <p className="text-lg italic mb-4">&ldquo;{quote}&rdquo;</p>
      <p className="font-semibold">{author}</p>
      <p className="text-gray-600">{role}</p>
    </div>
  );
}

function CTASection({ onGetStarted }) {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Streamline Your Forms?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of organizations already using 1-Form to simplify their paperwork process.
        </p>
        <Button
          size="lg"
          className="bg-white text-indigo-600 hover:bg-indigo-100 transition-colors duration-300"
          onClick={onGetStarted}
        >
          Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}

function PricingSection({ onGetStarted }) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <PricingTable />
      </div>
    </section>
  );
}

