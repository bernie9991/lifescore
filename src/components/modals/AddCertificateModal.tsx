import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import { triggerBadgeConfetti } from '../../utils/animations';

interface AddCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (certificates: string[]) => void;
  currentCertificates?: string[];
}

const AddCertificateModal: React.FC<AddCertificateModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  currentCertificates = [] 
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [certificates, setCertificates] = useState<string[]>(currentCertificates);
  const [newCertificate, setNewCertificate] = useState('');

  const commonCertificates = [
    'AWS Certified Solutions Architect',
    'Google Cloud Professional',
    'Microsoft Azure Fundamentals',
    'PMP (Project Management Professional)',
    'Certified Public Accountant (CPA)',
    'Certified Information Systems Security Professional (CISSP)',
    'Cisco Certified Network Associate (CCNA)',
    'Certified Ethical Hacker (CEH)',
    'Six Sigma Green Belt',
    'Scrum Master Certification',
    'Google Analytics Certified',
    'HubSpot Content Marketing',
    'Salesforce Administrator',
    'Adobe Certified Expert',
    'CompTIA Security+'
  ];

  const addCertificate = (cert: string) => {
    if (cert.trim() && !certificates.includes(cert.trim())) {
      setCertificates([...certificates, cert.trim()]);
      setNewCertificate('');
    }
  };

  const removeCertificate = (cert: string) => {
    setCertificates(certificates.filter(c => c !== cert));
  };

  const onSubmit = () => {
    onAdd(certificates);
    triggerBadgeConfetti('knowledge');
    handleClose();
  };

  const handleClose = () => {
    setCertificates(currentCertificates);
    setNewCertificate('');
    reset();
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
            className="relative bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Add Certificates</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Quick Add - Common Certificates */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Popular Certificates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {commonCertificates.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => addCertificate(cert)}
                      disabled={certificates.includes(cert)}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        certificates.includes(cert)
                          ? 'border-green-500 bg-green-900/20 text-green-300'
                          : 'border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{cert}</span>
                        {certificates.includes(cert) ? (
                          <Award className="w-4 h-4 text-green-400" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Certificate Input */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Add Custom Certificate</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCertificate}
                    onChange={(e) => setNewCertificate(e.target.value)}
                    placeholder="e.g., Custom Professional Certification"
                    className="flex-1 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addCertificate(newCertificate)}
                  />
                  <Button 
                    type="button"
                    onClick={() => addCertificate(newCertificate)} 
                    icon={Plus}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Current Certificates */}
              {certificates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Your Certificates ({certificates.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {certificates.map((cert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-600"
                      >
                        <div className="flex items-center space-x-3">
                          <Award className="w-5 h-5 text-blue-400" />
                          <span className="text-white">{cert}</span>
                        </div>
                        <button
                          onClick={() => removeCertificate(cert)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* XP Preview */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300">Knowledge Score Boost:</span>
                  <span className="text-2xl font-bold text-blue-400">
                    +{certificates.length * 1000} XP
                  </span>
                </div>
                <p className="text-blue-300 text-sm mt-2">
                  Each certificate adds 1000 XP to your knowledge score
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
                  type="button"
                  onClick={onSubmit}
                  className="flex-1"
                >
                  Save Certificates
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddCertificateModal;