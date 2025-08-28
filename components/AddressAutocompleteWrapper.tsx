"use client";

import dynamic from 'next/dynamic';

// Dynamically import AddressAutocomplete with no SSR
const AddressAutocomplete = dynamic(
  () => import('./AddressAutocomplete'),
  { 
    ssr: false,
    loading: () => (
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        placeholder="123 Main Street"
      />
    )
  }
);

export default AddressAutocomplete;