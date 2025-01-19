'use client';

import Layout from '../../components/layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function FAQPage() {
  const faqs = [
    {
      question: "What is 1-Form?",
      answer: "1-Form is a comprehensive form management platform designed to streamline the process of creating, distributing, and managing forms for various organizations and individuals."
    },
    {
      question: "How do I create a new form?",
      answer: "To create a new form, log into your account, navigate to the 'Forms' section, and click on the 'Create New Form' button. You can then use our intuitive form builder to add fields and customize your form.",
      link: { text: "Create Form", href: "/forms/create" }
    },
    {
      question: "What are file rooms?",
      answer: "File rooms are secure digital spaces where you can organize and manage forms for specific purposes or groups. They allow you to control access and keep related forms together.",
      link: { text: "View File Rooms", href: "/file-rooms" }
    },
    {
      question: "How does the FormAI Assistant work?",
      answer: "FormAI is an AI-powered assistant designed to help you quickly find information and get assistance with 1-Form. It can answer questions about forms, file rooms, and other features of our platform. FormAI is available on our Premium and Enterprise plans to enhance your experience and productivity.",
      action: { text: "Open FormAI", onClick: "openFormAI" }
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security very seriously. All data is encrypted both in transit and at rest. We use industry-standard security measures and regularly update our systems to ensure your information remains protected.",
      link: { text: "Privacy Policy", href: "/privacy-policy" }
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time. Go to the 'Billing' section in your account settings to upgrade or downgrade your plan. Changes will be reflected in your next billing cycle.",
      link: { text: "Manage Plan", href: "/billing" }
    },
    {
      question: "How do I share a form with others?",
      answer: "Once you've created a form, you can share it by creating a file room and inviting others to join. You can also generate a direct link to the form for easy distribution.",
      link: { text: "Create File Room", href: "/file-rooms/create" }
    },
    {
      question: "Is there a limit to how many forms I can create?",
      answer: "No, all our plans allow you to create unlimited forms. However, the number of file rooms and total users may vary depending on your plan.",
      link: { text: "View Pricing", href: "/pricing" }
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">{faq.answer}</p>
                {faq.link && (
                  <Link href={faq.link.href}>
                    <Button variant="outline" className="mt-2">
                      {faq.link.text}
                    </Button>
                  </Link>
                )}
                {faq.action && (
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => {
                      if (faq.action.onClick === "openFormAI") {
                        // Trigger FormAI interface
                        // This is a placeholder. You'll need to implement the actual
                        // functionality to open the FormAI interface.
                        console.log("Opening FormAI interface");
                      }
                    }}
                  >
                    {faq.action.text}
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
}

