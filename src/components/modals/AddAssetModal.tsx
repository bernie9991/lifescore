import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Car, Gem, Plus } from 'lucide-react';
import Button from '../common/Button';
import { triggerAchievementConfetti } from '../../utils/animations';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (asset: any) => void;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [selectedType, setSelectedType] = useState('');

  const assetTypes = [
    { id: 'home', name: 'Home/Property', icon: Home, placeholder: 'e.g., Main residence' },
    { id: 'car', name: 'Vehicle', icon: Car, placeholder: 'e.g., 2022 Tesla Model 3' },
    { id: 'jewelry', name: 'Jewelry/Valuables', icon: Gem, placeholder: 'e.g., Wedding ring' },
    { id: 'art', name: 'Art/Collectibles', icon: Plus, placeholder: 'e.g., Painting collection' },
    { id: 'other', name: 'Other', icon: Plus, placeholder: 'e.g., Equipment' }
  ];

  const handleTypeSelection = (typeId: string) => {
    setSelectedType(typeId);
    setValue('type', typeId); // This updates the form value
  };

  const onSubmit = (data: any) => {
    const newAsset = {
      id: crypto.randomUUID(),
      type: data.type,
      name: data.name,
      value: parseInt(data.value) || 0
    };
    
    onAdd(newAsset);
    triggerAchievementConfetti();
    reset();
    setSelectedType('');
    onClose();
  };

  const handleClose = () => {
    reset();
    setSelectedType('');
    onClose();
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
            className="relative bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Asset</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Asset Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Asset Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {assetTypes.map(({ id, name, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleTypeSelection(id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedType === id
                          ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                          : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-2" />
                      <div className="text-sm font-medium">{name}</div>
                    </button>
                  ))}
                </div>
                <input
                  {...register('type', { required: 'Asset type is required' })}
                  type="hidden"
                  value={selectedType}
                />
                {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type.message as string}</p>}
              </div>

              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Asset Name
                </label>
                <input
                  {...register('name', { required: 'Asset name is required' })}
                  type="text"
                  placeholder={selectedType ? assetTypes.find(t => t.id === selectedType)?.placeholder : 'Enter asset name'}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message as string}</p>}
              </div>

              {/* Asset Value */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estimated Value (USD)
                </label>
                <input
                  {...register('value', { 
                    required: 'Asset value is required',
                    min: { value: 1, message: 'Value must be greater than 0' }
                  })}
                  type="number"
                  placeholder="e.g., 45000"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.value && <p className="text-red-400 text-sm mt-1">{errors.value.message as string}</p>}
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
                  Add Asset
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddAssetModal;