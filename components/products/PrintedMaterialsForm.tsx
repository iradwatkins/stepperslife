"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  FileIcon, 
  UploadIcon, 
  XIcon, 
  CheckCircleIcon,
  CreditCardIcon 
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import ShippingCalculator from "./ShippingCalculator";

interface PrintedMaterialsFormProps {
  eventId?: Id<"events">;
  userId: string;
}

type ProductType = 
  | "business_card"
  | "palm_card"
  | "postcard"
  | "ticket"
  | "poster";

type DesignOption = "upload" | "one_side" | "two_sides";

interface ProductConfig {
  name: string;
  quantities: number[];
  prices: { [key: number]: number };
  weight: number; // Weight per 100 units in pounds
}

const PRODUCT_CONFIGS: Record<ProductType, ProductConfig> = {
  business_card: {
    name: "Business Cards",
    quantities: [100, 250, 500, 1000, 2500, 5000],
    prices: { 100: 25, 250: 45, 500: 75, 1000: 120, 2500: 250, 5000: 450 },
    weight: 0.5,
  },
  palm_card: {
    name: "Palm Cards (4x6)",
    quantities: [100, 250, 500, 1000, 2500, 5000],
    prices: { 100: 35, 250: 65, 500: 110, 1000: 180, 2500: 400, 5000: 750 },
    weight: 0.8,
  },
  postcard: {
    name: "Postcards",
    quantities: [100, 250, 500, 1000, 2500, 5000],
    prices: { 100: 40, 250: 75, 500: 125, 1000: 200, 2500: 450, 5000: 850 },
    weight: 1.0,
  },
  ticket: {
    name: "Generic/Numbered Tickets",
    quantities: [100, 250, 500, 1000, 2500, 5000],
    prices: { 100: 30, 250: 55, 500: 90, 1000: 150, 2500: 350, 5000: 650 },
    weight: 0.6,
  },
  poster: {
    name: 'Posters (12" x 18")',
    quantities: [10, 25, 50, 100],
    prices: { 10: 1250, 25: 2500, 50: 4500, 100: 8000 },
    weight: 5.0, // Per 10 posters
  },
};

const DESIGN_FEES = {
  one_side: 75,
  two_sides: 125,
};

export default function PrintedMaterialsForm({ eventId, userId }: PrintedMaterialsFormProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<ProductType>("business_card");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(100);
  const [designOption, setDesignOption] = useState<DesignOption>("upload");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [designInstructions, setDesignInstructions] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "overnight">("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createProductOrder = useMutation(api.products.createProductOrder);

  // Calculate pricing
  const productConfig = PRODUCT_CONFIGS[selectedProduct];
  const basePrice = productConfig.prices[selectedQuantity] || 0;
  const designFee = designOption === "upload" ? 0 :
                    designOption === "one_side" ? DESIGN_FEES.one_side :
                    DESIGN_FEES.two_sides;
  const subtotal = basePrice + designFee;
  
  // Calculate weight for shipping
  const weight = selectedProduct === "poster" 
    ? (selectedQuantity / 10) * productConfig.weight
    : (selectedQuantity / 100) * productConfig.weight;

  // Handle file drops for front design
  const onDropFront = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFrontFile(acceptedFiles[0]);
    }
  }, []);

  // Handle file drops for back design
  const onDropBack = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setBackFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps: getFrontRootProps, getInputProps: getFrontInputProps, isDragActive: isFrontDragActive } = useDropzone({
    onDrop: onDropFront,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/illustrator': ['.ai'],
    },
    maxFiles: 1,
    disabled: designOption !== "upload",
  });

  const { getRootProps: getBackRootProps, getInputProps: getBackInputProps, isDragActive: isBackDragActive } = useDropzone({
    onDrop: onDropBack,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/illustrator': ['.ai'],
    },
    maxFiles: 1,
    disabled: designOption !== "upload",
  });

  const handleSubmit = async () => {
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode) {
      alert("Please fill in all shipping address fields");
      return;
    }

    if (designOption === "upload" && !frontFile) {
      alert("Please upload at least a front design file");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload design files if provided
      let frontFileId = null;
      let backFileId = null;

      if (frontFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": frontFile.type },
          body: frontFile,
        });
        const { storageId } = await result.json();
        frontFileId = storageId;
      }

      if (backFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": backFile.type },
          body: backFile,
        });
        const { storageId } = await result.json();
        backFileId = storageId;
      }

      // Calculate shipping (would normally call the shipping calculator)
      const shippingCost = shippingMethod === "standard" ? 8 + weight * 1.5 :
                          shippingMethod === "express" ? 15 + weight * 2.5 :
                          30 + weight * 3.5;

      // Create order items
      const items = JSON.stringify([{
        productType: selectedProduct,
        productName: productConfig.name,
        quantity: selectedQuantity,
        unitPrice: basePrice / selectedQuantity,
        totalPrice: basePrice,
      }]);

      // Create the order
      const { orderId } = await createProductOrder({
        eventId,
        userId,
        orderType: eventId ? "event_products" : "general",
        items,
        designFiles: [{
          productId: "" as Id<"products">, // Would need actual product ID from database
          frontFileId: frontFileId as Id<"_storage"> | undefined,
          backFileId: backFileId as Id<"_storage"> | undefined,
          customDesignRequested: designOption !== "upload",
          designInstructions: designOption !== "upload" ? designInstructions : undefined,
        }],
        subtotal,
        designFees: designFee,
        shippingCost,
        totalAmount: subtotal + shippingCost,
        shippingAddress,
        totalWeight: weight,
        shippingMethod,
        customerNotes: designInstructions,
      });

      // Redirect to checkout
      router.push(`/products/checkout?orderId=${orderId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Product Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Product Type</h3>
        <RadioGroup value={selectedProduct} onValueChange={(value) => setSelectedProduct(value as ProductType)}>
          {Object.entries(PRODUCT_CONFIGS).map(([key, config]) => (
            <div key={key} className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value={key} id={key} />
              <Label htmlFor={key} className="cursor-pointer">
                {config.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Quantity Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Quantity</h3>
        <div className="grid grid-cols-3 gap-3">
          {productConfig.quantities.map((qty) => (
            <button
              key={qty}
              onClick={() => setSelectedQuantity(qty)}
              className={`p-3 border-2 rounded-lg transition-colors ${
                selectedQuantity === qty
                  ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="font-semibold">{qty.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ${productConfig.prices[qty]}
              </div>
            </button>
          ))}
        </div>
        {selectedProduct === "poster" && (
          <p className="mt-2 text-sm text-amber-600">
            Minimum order: 10 posters at $125 each
          </p>
        )}
      </div>

      {/* Design Option */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Design Option</h3>
        <RadioGroup value={designOption} onValueChange={(value) => setDesignOption(value as DesignOption)}>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload" className="cursor-pointer">
              Upload my own design files
            </Label>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="one_side" id="one_side" />
            <Label htmlFor="one_side" className="cursor-pointer">
              Design service - One side ($75)
            </Label>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="two_sides" id="two_sides" />
            <Label htmlFor="two_sides" className="cursor-pointer">
              Design service - Both sides ($125)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* File Upload (only shown when upload option selected) */}
      {designOption === "upload" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Design Files</h3>
          
          {/* Front Design */}
          <div>
            <Label className="mb-2 block">Front Design</Label>
            <div
              {...getFrontRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isFrontDragActive ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" : 
                frontFile ? "border-green-600 bg-green-50 dark:bg-green-900/20" : 
                "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getFrontInputProps()} />
              {frontFile ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <span className="font-medium">{frontFile.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFrontFile(null);
                    }}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isFrontDragActive ? "Drop the file here" : "Drag & drop your front design, or click to select"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Accepts: PDF, JPG, PNG, AI
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Back Design */}
          <div>
            <Label className="mb-2 block">Back Design (Optional)</Label>
            <div
              {...getBackRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isBackDragActive ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" : 
                backFile ? "border-green-600 bg-green-50 dark:bg-green-900/20" : 
                "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getBackInputProps()} />
              {backFile ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <span className="font-medium">{backFile.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setBackFile(null);
                    }}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isBackDragActive ? "Drop the file here" : "Drag & drop your back design, or click to select"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Accepts: PDF, JPG, PNG, AI
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Design Instructions (for design service) */}
      {designOption !== "upload" && (
        <div>
          <Label htmlFor="instructions" className="mb-2 block">
            Design Instructions
          </Label>
          <textarea
            id="instructions"
            value={designInstructions}
            onChange={(e) => setDesignInstructions(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Describe what you want designed..."
          />
        </div>
      )}

      {/* Shipping Calculator */}
      <ShippingCalculator
        weight={weight}
        shippingAddress={shippingAddress}
        setShippingAddress={setShippingAddress}
        shippingMethod={shippingMethod}
        setShippingMethod={setShippingMethod}
      />

      {/* Price Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{productConfig.name} ({selectedQuantity})</span>
            <span>${basePrice}</span>
          </div>
          {designFee > 0 && (
            <div className="flex justify-between">
              <span>Design Service</span>
              <span>${designFee}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping ({shippingMethod})</span>
            <span>Calculate at checkout</span>
          </div>
          <div className="pt-2 border-t border-gray-300">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${subtotal} + shipping</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-6 text-lg"
      >
        {isSubmitting ? (
          "Processing..."
        ) : (
          <>
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Proceed to Checkout
          </>
        )}
      </Button>
    </div>
  );
}