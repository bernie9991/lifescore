import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, MapPin, Calendar } from 'lucide-react';
import Button from '../common/Button';

interface BasicInfoStepProps {
  data: any;
  onNext: (data: any) => void;
  onPrev: () => void;
  canGoBack: boolean;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onNext, onPrev, canGoBack }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: data
  });

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Australia', 'Japan', 'Singapore', 'Brazil', 'India', 'China', 'Other'
  ];

  const onSubmit = (formData: any) => {
    // Clean the form data to ensure only serializable values are passed
    const cleanedData = {
      name: formData.name || '',
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      gender: formData.gender || '',
      country: formData.country || '',
      city: formData.city || ''
    };

    // Remove any undefined values to keep the object clean
    const finalData = Object.fromEntries(
      Object.entries(cleanedData).filter(([_, value]) => value !== undefined && value !== '')
    );

    onNext(finalData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 p-8 rounded-2xl border border-gray-700"
    >
      <h2 className="text-3xl font-bold text-white mb-2">Basic Information</h2>
      <p className="text-gray-300 mb-8">Tell us a bit about yourself</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="inline w-4 h-4 mr-2" />
              Full Name
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-2" />
              Age
            </label>
            <input
              {...register('age', { required: 'Age is required', min: 16, max: 100 })}
              type="number"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your age"
            />
            {errors.age && <p className="text-red-400 text-sm mt-1">Age must be between 16 and 100</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
          <select
            {...register('gender', { required: 'Gender is required' })}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender.message as string}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="inline w-4 h-4 mr-2" />
              Country
            </label>
            <select
              {...register('country', { required: 'Country is required' })}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <input
              {...register('city', { required: 'City is required' })}
              type="text"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your city"
            />
            {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city.message as string}</p>}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          {canGoBack && (
            <Button variant="secondary" onClick={onPrev}>
              Back
            </Button>
          )}
          <Button type="submit" className={!canGoBack ? 'ml-auto' : ''}>
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default BasicInfoStep;