import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Home, Car, Gem, Plus, X } from 'lucide-react';
import Button from '../common/Button';

interface AssetsStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrev: () => void;
  canGoBack: boolean;
}

const AssetsStep: React.FC<AssetsStepProps> = ({ data, onNext, onPrev, canGoBack }) => {
  const [assets, setAssets] = useState(data.assets || []);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const assetTypes = [
    { id: 'home', name: 'Home/Property', icon: Home, placeholder: 'e.g., Main residence' },
    { id: 'car', name: 'Vehicle', icon: Car, placeholder: 'e.g., 2022 Tesla Model 3' },
    { id: 'jewelry', name: 'Jewelry/Valuables', icon: Gem, placeholder: 'e.g., Wedding ring' }
  ];

  const addAsset = (type: string, name: string, value: number) => {
    const newAsset = {
      id: crypto.randomUUID(),
      type,
      name,
      value: parseInt(value.toString()) || 0
    };
    setAssets([...assets, newAsset]);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter((asset: any) => asset.id !== id));
  };

  const onSubmitCustomAsset = (formData: any) => {
    addAsset(formData.type, formData.name, formData.value);
    reset();
    setShowCustomForm(false);
  };

  const handleNext = () => {
    onNext({ assets });
  };

  const totalAssetValue = assets.reduce((sum: number, asset: any) => sum + asset.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-8 rounded-2xl border border-gray-700"
    >
      <h2 className="text-3xl font-bold text-white mb-2">Your Assets</h2>
      <p className="text-gray-300 mb-8">Add your major assets to get a complete picture</p>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {assetTypes.map(({ id, name, icon: Icon, placeholder }) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const assetName = prompt(`Enter ${name.toLowerCase()} name:`, placeholder);
              const assetValue = prompt(`Enter ${name.toLowerCase()} value:`);
              if (assetName && assetValue) {
                addAsset(id, assetName, parseInt(assetValue));
              }
            }}
            className="bg-gray-900 border border-gray-600 rounded-lg p-4 text-left hover:border-blue-500 transition-colors"
          >
            <Icon className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="font-medium text-white">{name}</h3>
            <p className="text-gray-400 text-sm">Click to add</p>
          </motion.button>
        ))}
      </div>

      {/* Custom Asset Form */}
      {showCustomForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-900 p-6 rounded-lg border border-gray-600 mb-6"
        >
          <form onSubmit={handleSubmit(onSubmitCustomAsset)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                {...register('type', { required: true })}
                className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="home">Home/Property</option>
                <option value="car">Vehicle</option>
                <option value="jewelry">Jewelry</option>
                <option value="art">Art/Collectibles</option>
                <option value="other">Other</option>
              </select>
              
              <input
                {...register('name', { required: true })}
                placeholder="Asset name"
                className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                {...register('value', { required: true })}
                type="number"
                placeholder="Value"
                className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" size="sm">Add Asset</Button>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm"
                onClick={() => setShowCustomForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Custom Asset Button */}
      {!showCustomForm && (
        <Button
          variant="ghost"
          icon={Plus}
          onClick={() => setShowCustomForm(true)}
          className="mb-6"
        >
          Add Custom Asset
        </Button>
      )}

      {/* Asset List */}
      {assets.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-white">Your Assets:</h3>
          {assets.map((asset: any) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between bg-gray-900 p-4 rounded-lg border border-gray-600"
            >
              <div>
                <h4 className="font-medium text-white">{asset.name}</h4>
                <p className="text-gray-400 text-sm capitalize">{asset.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-semibold">
                  ${asset.value.toLocaleString()}
                </span>
                <button
                  onClick={() => removeAsset(asset.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Asset Value:</span>
              <span className="text-2xl font-bold text-green-400">
                ${totalAssetValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="secondary" onClick={onPrev}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default AssetsStep;