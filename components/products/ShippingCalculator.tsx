"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TruckIcon, RocketIcon, ZapIcon } from "lucide-react";

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
}

interface ShippingCalculatorProps {
  weight: number; // Weight in pounds
  shippingAddress: ShippingAddress;
  setShippingAddress: (address: ShippingAddress) => void;
  shippingMethod: "standard" | "express" | "overnight";
  setShippingMethod: (method: "standard" | "express" | "overnight") => void;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function ShippingCalculator({
  weight,
  shippingAddress,
  setShippingAddress,
  shippingMethod,
  setShippingMethod,
}: ShippingCalculatorProps) {
  const [shippingCost, setShippingCost] = useState(0);

  // Calculate shipping cost based on weight and method
  useEffect(() => {
    const calculateShipping = () => {
      const baseRates = {
        standard: { base: 8, perPound: 1.5, days: "5-7 business days" },
        express: { base: 15, perPound: 2.5, days: "2-3 business days" },
        overnight: { base: 30, perPound: 3.5, days: "1 business day" },
      };

      const rate = baseRates[shippingMethod];
      const cost = rate.base + Math.max(0, weight - 1) * rate.perPound;
      setShippingCost(Math.round(cost * 100) / 100);
    };

    calculateShipping();
  }, [weight, shippingMethod]);

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress({
      ...shippingAddress,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={shippingAddress.name}
              onChange={(e) => handleAddressChange("name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              type="text"
              value={shippingAddress.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                placeholder="New York"
                required
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <select
                id="state"
                value={shippingAddress.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                required
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                type="text"
                value={shippingAddress.zipCode}
                onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                placeholder="10001"
                pattern="[0-9]{5}(-[0-9]{4})?"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={shippingAddress.phone || ""}
                onChange={(e) => handleAddressChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Shipping Method</h3>
        <RadioGroup value={shippingMethod} onValueChange={(value) => setShippingMethod(value as typeof shippingMethod)}>
          <div className="space-y-3">
            <label
              htmlFor="standard"
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                shippingMethod === "standard"
                  ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center">
                <RadioGroupItem value="standard" id="standard" className="mr-3" />
                <TruckIcon className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className="font-medium">Standard Shipping</div>
                  <div className="text-sm text-gray-600">5-7 business days</div>
                </div>
              </div>
              <div className="font-semibold">
                ${(8 + Math.max(0, weight - 1) * 1.5).toFixed(2)}
              </div>
            </label>

            <label
              htmlFor="express"
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                shippingMethod === "express"
                  ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center">
                <RadioGroupItem value="express" id="express" className="mr-3" />
                <RocketIcon className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className="font-medium">Express Shipping</div>
                  <div className="text-sm text-gray-600">2-3 business days</div>
                </div>
              </div>
              <div className="font-semibold">
                ${(15 + Math.max(0, weight - 1) * 2.5).toFixed(2)}
              </div>
            </label>

            <label
              htmlFor="overnight"
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                shippingMethod === "overnight"
                  ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center">
                <RadioGroupItem value="overnight" id="overnight" className="mr-3" />
                <ZapIcon className="h-5 w-5 mr-2 text-gray-600" />
                <div>
                  <div className="font-medium">Overnight Shipping</div>
                  <div className="text-sm text-gray-600">1 business day</div>
                </div>
              </div>
              <div className="font-semibold">
                ${(30 + Math.max(0, weight - 1) * 3.5).toFixed(2)}
              </div>
            </label>
          </div>
        </RadioGroup>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Package weight: {weight.toFixed(2)} lbs
            </span>
            <span className="font-semibold text-cyan-600">
              Shipping: ${shippingCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}