import React from 'react';
import { Address } from './types';

interface AddressSectionProps {
  address: Address;
}

const AddressSection: React.FC<AddressSectionProps> = ({ address }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Country</p>
            <p className="text-sm text-gray-800">{address.country || 'N/A'}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">City</p>
            <p className="text-sm text-gray-800">{address.city || 'N/A'}</p>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">District</p>
            <p className="text-sm text-gray-800">{address.district || 'N/A'}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Ward</p>
            <p className="text-sm text-gray-800">{address.ward || 'N/A'}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500">Address Detail</p>
            <p className="text-sm text-gray-800">{address.addressDetail || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSection; 