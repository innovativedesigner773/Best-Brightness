import React from 'react';
import { Plus, Percent, Calendar, TrendingUp } from 'lucide-react';

export default function AdminPromotions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
            <p className="text-gray-600 mt-2">Create and manage promotional campaigns</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create Promotion
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <Percent className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Promotion Management</h3>
            <p className="text-gray-500 mb-4">
              This page will contain the complete promotion management system:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
              <li>• Create percentage and fixed amount discounts</li>
              <li>• BOGO (Buy One Get One) deals</li>
              <li>• Flash sales with countdown timers</li>
              <li>• Promo code generation and management</li>
              <li>• Schedule promotions with start/end dates</li>
              <li>• Target specific products or categories</li>
              <li>• Analytics and performance tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}