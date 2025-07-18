import React, { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { formatCurrency } from '../../lib/goldPrice';

interface AdminSettingsTabProps {
  fallbackGoldPrice: number;
  gstRate: number;
  goldPrice: number;
  updateSetting: (key: string, value: string) => Promise<boolean>;
}

export function AdminSettingsTab({ 
  fallbackGoldPrice, 
  gstRate, 
  goldPrice, 
  updateSetting 
}: AdminSettingsTabProps) {
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({
    fallback_gold_price: fallbackGoldPrice.toString(),
    gst_rate: (gstRate * 100).toString(),
  });

  React.useEffect(() => {
    setSettingsFormData({
      fallback_gold_price: fallbackGoldPrice.toString(),
      gst_rate: (gstRate * 100).toString(),
    });
  }, [fallbackGoldPrice, gstRate]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const fallbackPrice = parseFloat(settingsFormData.fallback_gold_price);
      const gstDecimal = parseFloat(settingsFormData.gst_rate) / 100;

      const success1 = await updateSetting('fallback_gold_price', fallbackPrice.toString());
      const success2 = await updateSetting('gst_rate', gstDecimal.toString());

      if (success1 && success2) {
        alert('Settings updated successfully!');
        setShowSettingsForm(false);
      } else {
        alert('Error updating settings. Please try again.');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings. Please check your input values.');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
        <button
          onClick={() => setShowSettingsForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
        >
          <Edit className="h-5 w-5" />
          <span>Edit Settings</span>
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Fallback Gold Price</h3>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(fallbackGoldPrice)}/gram</p>
            <p className="text-sm text-yellow-700 mt-1">Used when live API fails</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">GST Rate</h3>
            <p className="text-2xl font-bold text-green-600">{Math.round(gstRate * 100)}%</p>
            <p className="text-sm text-green-700 mt-1">Applied to all jewellery items</p>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Live Gold Price:</span>
              <span className="font-medium">{formatCurrency(goldPrice)}/gram</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price Source:</span>
              <span className="font-medium">{goldPrice === fallbackGoldPrice ? 'Fallback' : 'Live API'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form Modal */}
      {showSettingsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit System Settings</h2>
              <button onClick={() => setShowSettingsForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fallback Gold Price (₹/gram)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settingsFormData.fallback_gold_price}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, fallback_gold_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  placeholder="5450"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used when live gold price API is unavailable
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settingsFormData.gst_rate}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, gst_rate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  placeholder="18"
                />
                <p className="text-xs text-gray-500 mt-1">
                  GST percentage applied to all jewellery items
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettingsForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}