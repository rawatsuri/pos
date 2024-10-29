import React from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, buttonLabel, onButtonClick }) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {buttonLabel && (
        <button
          onClick={onButtonClick}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default PageHeader;