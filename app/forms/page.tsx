'use client';

import Layout from '../../components/layout';
import { useForms } from '../../hooks/useForms';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function Forms() {
  const { forms, loading, error } = useForms();

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">Your Forms</h1>
          <div className="mb-8 flex justify-between items-center">
            <Link href="/forms/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">Create New Form</Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size={60} color="#4F46E5" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {forms.map((form) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/forms/${form.id}`}>
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-center">{form.formName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                          {form.formName?.charAt(0).toUpperCase()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          {!loading && forms.length === 0 && (
            <p className="text-center text-gray-500 mt-8">
              You haven't created any forms yet. Click "Create New Form" to get started.
            </p>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

