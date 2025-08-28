"use client";

import { useState } from "react";
import SimpleAddressForm from "@/components/SimpleAddressForm";

export default function TestAddressFormPage() {
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    postalCode: ""
  });
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: any = {};
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      alert("Form submitted successfully!\n" + JSON.stringify(formData, null, 2));
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Working Address Form</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <SimpleAddressForm
            address={formData.address}
            city={formData.city}
            state={formData.state}
            postalCode={formData.postalCode}
            onAddressChange={(value) => setFormData({...formData, address: value})}
            onCityChange={(value) => setFormData({...formData, city: value})}
            onStateChange={(value) => setFormData({...formData, state: value})}
            onPostalCodeChange={(value) => setFormData({...formData, postalCode: value})}
            errors={errors}
          />
          
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ address: "", city: "", state: "", postalCode: "" });
                setErrors({});
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Clear
            </button>
          </div>
        </form>
        
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Features:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>City autocomplete (type "New", "Los", "Chi", etc.)</li>
            <li>State dropdown with all US states</li>
            <li>ZIP code validation (numbers only, max 5 digits)</li>
            <li>Mobile responsive layout</li>
            <li>No Google Maps API needed!</li>
          </ul>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This form works perfectly without any Google Maps API. 
            The city autocomplete suggests major US cities and auto-fills the state.
          </p>
        </div>
      </div>
    </div>
  );
}