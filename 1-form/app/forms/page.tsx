'use client';

import Layout from '../../components/layout';
import { useForms } from '../../hooks/useForms';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Forms() {
  const { forms, loading, error } = useForms();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-xl">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Your Forms</h1>
          <Link href="/forms/create">
            <Button>Add New Form</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {forms.map((form) => (
            <div key={form.id} className="text-center">
              <Link href={`/forms/${form.id}`}>
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 hover:bg-blue-200 transition">
                  {form.formName?.charAt(0).toUpperCase()}
                </div>
                <p className="mt-2 text-sm text-gray-600">{form.formName}</p>
              </Link>
            </div>
          ))}
        </div>
        {forms.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            You haven't created any forms yet. Click "Add New Form" to get started.
          </p>
        )}
      </div>
    </Layout>
  );
}

