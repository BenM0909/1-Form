import { Button } from '@/components/ui/button';
import Link from 'next/link';

const plans = [
{
  name: 'Basic',
  price: '$0',
  features: {
    forms: 'Unlimited',
    'joined rooms': 'Unlimited',
    'file rooms': 0,
    users: 0,
    support: 'Email',
    'AI assistant': 'Not included',
    'FormAI Form Uploader': 'Not included',
  },
},
{
  name: 'Pro',
  price: '$19',
  features: {
    forms: 'Unlimited',
    'joined rooms': 'Unlimited',
    'file rooms': '2',
    users: '250',
    support: 'Email',
    'AI assistant': 'Not included',
    'FormAI Form Uploader': '1 upload',
  },
},
{
  name: 'Premium',
  price: '$49',
  features: {
    forms: 'Unlimited',
    'joined rooms': 'Unlimited',
    'file rooms': '10',
    users: '750',
    support: 'Priority',
    'AI assistant': 'Full access',
    'FormAI Form Uploader': '5 uploads',
  },
},
{
  name: 'Enterprise',
  price: '$159',
  features: {
    forms: 'Unlimited',
    'joined rooms': 'Unlimited',
    'file rooms': 'Unlimited',
    users: 'Unlimited',
    support: 'Priority',
    'AI assistant': 'Full access',
    'FormAI Form Uploader': 'Unlimited',
  },
},
];

export function PricingTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left font-semibold">Feature</th>
            {plans.map((plan) => (
              <th key={plan.name} className="p-4 text-center font-semibold">
                {plan.name}
                <div className="text-indigo-600 font-bold">{plan.price}/mo</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(plans[0].features).map(([feature, _]) => (
            <tr key={feature} className="border-b">
              <td className="p-4 font-medium capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</td>
              {plans.map((plan) => (
                <td key={`${plan.name}-${feature}`} className="p-4 text-center">
                  {plan.features[feature] === 'Unlimited' || plan.features[feature] === 0 ? (
                    plan.features[feature].toString()
                  ) : (
                    plan.features[feature]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8 text-center">
        <Link href="/pricing">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">
            View Full Pricing Details
          </Button>
        </Link>
      </div>
    </div>
  );
}

