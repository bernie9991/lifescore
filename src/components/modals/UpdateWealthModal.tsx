import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import Button from '../common/Button';
import { triggerLevelUpConfetti } from '../../utils/animations';
import { User } from '../../types';

interface UpdateWealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (wealthData: any) => void;
  currentWealth?: User['wealth'];
}

const UpdateWealthModal: React.FC<UpdateWealthModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  currentWealth 
}) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      salary: currentWealth?.salary || 0,
      savings: currentWealth?.savings || 0,
      investments: currentWealth?.investments || 0,
      currency: currentWealth?.currency || 'USD'
    }
  });

  const watchedValues = watch();

  const onSubmit = (data: any) => {
    const total = (parseInt(data.salary) || 0) + 
                  (parseInt(data.savings) || 0) + 
                  (parseInt(data.investments) || 0);
    
    const wealthData = {
      salary: parseInt(data.salary) || 0,
      savings: parseInt(data.savings) || 0,
      investments: parseInt(data.investments) || 0,
      currency: data.currency || 'USD',
      total
    };

    // Only include id if it exists and is not undefined
    if (currentWealth?.id) {
      wealthData.id = currentWealth.id;
    }
    
    onUpdate(wealthData);
    triggerLevelUpConfetti();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const calculateTotal = () => {
    return (parseInt(watchedValues.salary) || 0) + 
           (parseInt(watchedValues.savings) || 0) + 
           (parseInt(watchedValues.investments) || 0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Update Wealth</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                <select
                  {...register('currency')}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              {/* Financial Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="inline w-4 h-4 mr-2" />
                    Annual Salary
                  </label>
                  <input
                    {...register('salary', { min: 0 })}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Wallet className="inline w-4 h-4 mr-2" />
                    Savings
                  </label>
                  <input
                    {...register('savings', { min: 0 })}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <TrendingUp className="inline w-4 h-4 mr-2" />
                    Investments
                  </label>
                  <input
                    {...register('investments', { min: 0 })}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Total Preview */}
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Net Worth:</span>
                  <span className="text-2xl font-bold text-green-400">
                    {watchedValues.currency} {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Privacy Note:</strong> Your financial information is private and used only for ranking calculations.
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Update Wealth
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpdateWealthModal;