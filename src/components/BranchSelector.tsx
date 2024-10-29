import React, { useState } from 'react';
import { ChevronDown, MapPin, Phone } from 'lucide-react';
import { useBranchStore } from '../store/branch';

const BranchSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { branches, selectedBranch, selectBranch } = useBranchStore();

  const handleBranchSelect = (branchId: string) => {
    selectBranch(branchId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center">
          <MapPin size={20} className="text-gray-500 mr-2" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-700">
              {selectedBranch?.name || 'Select Branch'}
            </p>
            {selectedBranch && (
              <p className="text-xs text-gray-500">{selectedBranch.address}</p>
            )}
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => handleBranchSelect(branch.id)}
              className={`w-full p-3 text-left hover:bg-gray-50 ${
                selectedBranch?.id === branch.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700">{branch.name}</p>
                  <p className="text-sm text-gray-500">{branch.address}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone size={16} className="mr-1" />
                  {branch.phone}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;