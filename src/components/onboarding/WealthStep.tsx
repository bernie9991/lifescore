import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { DollarSign, Wallet, TrendingUp } from 'lucide-react';
import Button from '../common/Button';

interface WealthStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrev: () => void;
  canGoBack: boolean;
}

const WealthStep: React.FC<WealthStepProps> = ({ data, onNext, onPrev, canGoBack }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: data.wealth || { currency: 'USD' }
  });

  const watchedValues = watch();

  const parseIntegerValue = (value: string | number): number => {
    if (value === '' || value === null || value === undefined) {
      return 0;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const onSubmit = (formData: any) => {
    const salary = parseIntegerValue(formData.salary);
    const savings = parseIntegerValue(formData.savings);
    const investments = parseIntegerValue(formData.investments);
    const total = salary + savings + investments;
    
    onNext({
      wealth: {
        currency: formData.currency || 'USD',
        salary,
        savings,
        investments,
        total
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-8 rounded-2xl border border-gray-700"
    >
      <h2 className="text-3xl font-bold text-white mb-2">Financial Information</h2>
      <p className="text-gray-300 mb-8">Help us understand your financial standing (all amounts in your selected currency)</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <DollarSign className="inline w-4 h-4 mr-2" />
              Annual Salary
            </label>
            <input
              {...register('salary')}
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
              {...register('savings')}
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
              {...register('investments')}
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
              {watchedValues.currency} {(
                parseIntegerValue(watchedValues.salary) + 
                parseIntegerValue(watchedValues.savings) + 
                parseIntegerValue(watchedValues.investments)
              ).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            💡 <strong>Privacy Note:</strong> Your financial information is private and used only for ranking calculations. 
            You can always update or remove this data later.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="secondary" onClick={onPrev}>
            Back
          </Button>
          <Button type="submit">
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default WealthStep;