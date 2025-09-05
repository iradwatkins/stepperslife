"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  ShirtIcon,
  UploadIcon,
  CheckCircleIcon,
  XIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import ShippingCalculator from "./ShippingCalculator";

interface TShirtOrderFormProps {
  eventId?: Id<"events">;
  userId: string;
}

interface SizeQuantity {
  size: string;
  quantity: number;
}

type DesignOption = "catalog" | "custom";

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];
const CUSTOM_DESIGN_FEE = 35;
const TSHIRT_WEIGHT = 0.5; // Weight per shirt in pounds

export default function TShirtOrderForm({ eventId, userId }: TShirtOrderFormProps) {
  const router = useRouter();
  const [designOption, setDesignOption] = useState<DesignOption>("catalog");
  const [selectedDesignId, setSelectedDesignId] = useState<string>("");
  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantity[]>(
    SIZES.map(size => ({ size, quantity: 0 }))
  );
  const [customDesignFile, setCustomDesignFile] = useState<File | null>(null);
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

  const tshirtDesigns = useQuery(api.products.getTshirtDesigns);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createProductOrder = useMutation(api.products.createProductOrder);

  // Calculate totals
  const totalQuantity = sizeQuantities.reduce((sum, sq) => sum + sq.quantity, 0);
  const basePrice = totalQuantity * CUSTOM_DESIGN_FEE;
  const designFee = designOption === "custom" ? CUSTOM_DESIGN_FEE : 0;
  const subtotal = basePrice + designFee;
  const weight = totalQuantity * TSHIRT_WEIGHT;

  // Handle file drop for custom design
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setCustomDesignFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/illustrator': ['.ai'],
    },
    maxFiles: 1,
    disabled: designOption !== "custom",
  });

  const updateQuantity = (size: string, delta: number) => {
    setSizeQuantities(prev => 
      prev.map(sq => 
        sq.size === size 
          ? { ...sq, quantity: Math.max(0, sq.quantity + delta) }
          : sq
      )
    );
  };

  const handleSubmit = async () => {
    if (totalQuantity === 0) {
      alert("Please select at least one t-shirt");
      return;
    }

    if (designOption === "catalog" && !selectedDesignId) {
      alert("Please select a t-shirt design from the catalog");
      return;
    }

    if (designOption === "custom" && !customDesignFile && !designInstructions) {
      alert("Please upload a design file or provide design instructions");
      return;
    }

    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode) {
      alert("Please fill in all shipping address fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload custom design file if provided
      let customDesignFileId = null;
      if (customDesignFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": customDesignFile.type },
          body: customDesignFile,
        });
        const { storageId } = await result.json();
        customDesignFileId = storageId;
      }

      // Calculate shipping
      const shippingCost = shippingMethod === "standard" ? 8 + weight * 1.5 :
                          shippingMethod === "express" ? 15 + weight * 2.5 :
                          30 + weight * 3.5;

      // Create order items
      const items = JSON.stringify([{
        productType: "tshirt",
        productName: designOption === "catalog" 
          ? `T-Shirt Design #${selectedDesignId}` 
          : "Custom T-Shirt",
        sizeBreakdown: sizeQuantities.filter(sq => sq.quantity > 0),
        totalQuantity,
        unitPrice: CUSTOM_DESIGN_FEE,
        totalPrice: basePrice,
      }]);

      // Create the order
      const { orderId } = await createProductOrder({
        eventId,
        userId,
        orderType: eventId ? "event_products" : "general",
        items,
        designFiles: designOption === "custom" ? [{
          productId: "" as Id<"products">,
          frontFileId: customDesignFileId as Id<"_storage"> | undefined,
          customDesignRequested: true,
          designInstructions,
        }] : undefined,
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
      {/* Design Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Design Option</h3>
        <RadioGroup value={designOption} onValueChange={(value) => setDesignOption(value as DesignOption)}>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="catalog" id="catalog" />
            <Label htmlFor="catalog" className="cursor-pointer">
              Choose from our catalog
            </Label>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="cursor-pointer">
              Upload custom design ($35 design fee)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Catalog Selection */}
      {designOption === "catalog" && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Select a Design</h3>
          {!tshirtDesigns || tshirtDesigns.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <ShirtIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                No t-shirt designs available yet.
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Admin will add designs soon. You can upload a custom design instead.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tshirtDesigns?.map((design) => (
                <div
                  key={design._id}
                  onClick={() => setSelectedDesignId(design._id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDesignId === design._id
                      ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                    <ShirtIcon className="h-16 w-16 text-gray-400" />
                  </div>
                  <h4 className="font-medium">{design.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${design.basePrice} each
                  </p>
                  {design.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {design.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Design Upload */}
      {designOption === "custom" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Your Design</h3>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20" : 
              customDesignFile ? "border-green-600 bg-green-50 dark:bg-green-900/20" : 
              "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            {customDesignFile ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <span className="font-medium">{customDesignFile.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomDesignFile(null);
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
                  {isDragActive ? "Drop the file here" : "Drag & drop your design, or click to select"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Accepts: PDF, JPG, PNG, AI
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="design-instructions" className="mb-2 block">
              Design Instructions (Optional)
            </Label>
            <textarea
              id="design-instructions"
              value={designInstructions}
              onChange={(e) => setDesignInstructions(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Describe placement, size, colors, or any special requirements..."
            />
          </div>
        </div>
      )}

      {/* Size Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Sizes & Quantities</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sizeQuantities.map((sq) => (
            <div key={sq.size} className="border rounded-lg p-4">
              <div className="text-center font-medium mb-2">Size {sq.size}</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => updateQuantity(sq.size, -1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  disabled={sq.quantity === 0}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={sq.quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value) || 0;
                    setSizeQuantities(prev => 
                      prev.map(item => 
                        item.size === sq.size 
                          ? { ...item, quantity: Math.max(0, newQty) }
                          : item
                      )
                    );
                  }}
                  className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                  min="0"
                />
                <button
                  onClick={() => updateQuantity(sq.size, 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {totalQuantity > 0 && (
          <p className="mt-4 text-center font-medium">
            Total: {totalQuantity} shirt{totalQuantity !== 1 ? 's' : ''}
          </p>
        )}
      </div>

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
          {totalQuantity > 0 && (
            <div className="flex justify-between">
              <span>T-Shirts ({totalQuantity} × ${CUSTOM_DESIGN_FEE})</span>
              <span>${basePrice}</span>
            </div>
          )}
          {designFee > 0 && (
            <div className="flex justify-between">
              <span>Custom Design Fee</span>
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
        disabled={isSubmitting || totalQuantity === 0}
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