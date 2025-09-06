"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface TicketSelectorProps {
  eventName: string;
  date: string;
  price: number;
  maxQuantity?: number;
  onPurchase: (quantity: number) => void;
  disabled?: boolean;
}

export default function TicketSelector({
  eventName,
  date,
  price,
  maxQuantity = 10,
  onPurchase,
  disabled = false
}: TicketSelectorProps) {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  const total = price * quantity;

  return (
    <div className="space-y-4">
      {/* Ticket Type Row */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{eventName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            RD${price.toFixed(0)}
          </p>
        </div>
        
        {/* Quantity Selector */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleDecrease}
            disabled={quantity === 0 || disabled}
            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
            {quantity}
          </span>
          
          <button
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity || disabled}
            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Purchase Button */}
      <button
        onClick={() => onPurchase(quantity)}
        disabled={quantity === 0 || disabled}
        className="w-full bg-gray-800 dark:bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        <span className="flex items-center justify-between">
          <span>Buy now</span>
          <span>RD${total.toFixed(0)}</span>
        </span>
      </button>
    </div>
  );
}