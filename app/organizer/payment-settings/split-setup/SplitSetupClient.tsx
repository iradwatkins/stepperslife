"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Share2, 
  Plus, 
  X, 
  Users, 
  DollarSign, 
  Calculator,
  ArrowRight,
  CreditCard,
  AlertCircle,
  Check
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

interface SplitSetupClientProps {
  userId: string;
}

interface Partner {
  id: string;
  name: string;
  email: string;
  percentage: number;
}

export default function SplitSetupClient({ userId }: SplitSetupClientProps) {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([
    { id: "owner", name: "You (Organizer)", email: "", percentage: 100 }
  ]);
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newPartnerEmail, setNewPartnerEmail] = useState("");
  const [newPartnerPercentage, setNewPartnerPercentage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const totalPercentage = partners.reduce((sum, p) => sum + p.percentage, 0);
  const isValid = totalPercentage === 100;

  const addPartner = () => {
    if (!newPartnerName || !newPartnerEmail || !newPartnerPercentage) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all partner details",
      });
      return;
    }

    const percentage = parseFloat(newPartnerPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      toast({
        variant: "destructive",
        title: "Invalid Percentage",
        description: "Please enter a valid percentage between 0 and 100",
      });
      return;
    }

    const newPartner: Partner = {
      id: Date.now().toString(),
      name: newPartnerName,
      email: newPartnerEmail,
      percentage: percentage
    };

    // Adjust organizer percentage
    const organizerShare = 100 - (totalPercentage - partners[0].percentage + percentage);
    setPartners([
      { ...partners[0], percentage: Math.max(0, organizerShare) },
      ...partners.slice(1),
      newPartner
    ]);

    // Clear form
    setNewPartnerName("");
    setNewPartnerEmail("");
    setNewPartnerPercentage("");
  };

  const removePartner = (id: string) => {
    const partnerToRemove = partners.find(p => p.id === id);
    if (!partnerToRemove) return;

    const newPartners = partners.filter(p => p.id !== id);
    // Give the percentage back to the organizer
    newPartners[0].percentage += partnerToRemove.percentage;
    setPartners(newPartners);
  };

  const updatePartnerPercentage = (id: string, newPercentage: string) => {
    const percentage = parseFloat(newPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) return;

    setPartners(partners.map(p => 
      p.id === id ? { ...p, percentage } : p
    ));
  };

  const handleSave = async () => {
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Split Configuration",
        description: "Total percentage must equal 100%",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save split configuration (would call a mutation)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Split Configuration Saved",
        description: "Your revenue sharing setup is complete",
      });

      // Redirect back to payment settings
      setTimeout(() => {
        router.push("/organizer/payment-settings");
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "Please try again",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Split Payment Setup</h1>
          <p className="text-gray-600 mt-2">Configure automatic revenue sharing with partners</p>
        </div>
        <Link href="/organizer/payment-settings">
          <Button variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="partners">
            <Users className="w-4 h-4 mr-2" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Accounts
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Calculator className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Partners Tab */}
        <TabsContent value="partners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sharing Partners</CardTitle>
              <CardDescription>
                Add partners and configure how ticket revenue will be split
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Partners */}
              <div className="space-y-3">
                {partners.map((partner) => (
                  <div key={partner.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{partner.name}</div>
                      {partner.email && (
                        <div className="text-sm text-gray-600">{partner.email}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={partner.percentage}
                        onChange={(e) => updatePartnerPercentage(partner.id, e.target.value)}
                        className="w-20 text-right"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="text-gray-600">%</span>
                    </div>
                    {partner.id !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePartner(partner.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Percentage Check */}
              <div className={`p-4 rounded-lg ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                      Total: {totalPercentage}%
                    </span>
                  </div>
                  {!isValid && (
                    <span className="text-sm text-red-600">
                      Must equal 100%
                    </span>
                  )}
                </div>
              </div>

              {/* Add New Partner */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Add New Partner</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      placeholder="Partner name"
                      value={newPartnerName}
                      onChange={(e) => setNewPartnerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="partner@email.com"
                      value={newPartnerEmail}
                      onChange={(e) => setNewPartnerEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Percentage</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      value={newPartnerPercentage}
                      onChange={(e) => setNewPartnerPercentage(e.target.value)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addPartner} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect Payment Accounts</CardTitle>
              <CardDescription>
                Split payments require Stripe or Square to handle automatic distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Required: Connect Stripe or Square</p>
                    <p>Split payments use Stripe Connect or Square's split payment feature to automatically distribute funds to all partners.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Stripe</h4>
                      <p className="text-sm text-gray-600">Best for automated splits</p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/organizer/connect/stripe">
                      Connect Stripe
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Square</h4>
                      <p className="text-sm text-gray-600">Great for in-person events</p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/organizer/connect/square">
                      Connect Square
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 border-2 border-dashed rounded-lg">
                <h4 className="font-semibold mb-2">How Split Payments Work:</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li>1. Customer purchases a ticket for your event</li>
                  <li>2. Payment is processed through your connected account</li>
                  <li>3. Platform automatically splits the payment based on your percentages</li>
                  <li>4. Each partner receives their share directly to their account</li>
                  <li>5. No manual reconciliation needed!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Split Preview</CardTitle>
              <CardDescription>
                See how ticket revenue will be distributed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Example Ticket Price</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-600">$</span>
                  <Input
                    type="number"
                    defaultValue="50"
                    className="w-32"
                    id="preview-price"
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      document.querySelectorAll('.partner-amount').forEach((el, i) => {
                        const percentage = partners[i].percentage;
                        el.textContent = `$${(price * percentage / 100).toFixed(2)}`;
                      });
                    }}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Distribution Breakdown</h4>
                <div className="space-y-2">
                  {partners.map((partner, index) => (
                    <div key={partner.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">{partner.name}</div>
                        {partner.email && (
                          <div className="text-sm text-gray-600">{partner.email}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold partner-amount">
                          ${(50 * partner.percentage / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {partner.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-medium mb-1">Processing Fees</p>
                    <p>Processing fees (2.9% + $0.30) will be deducted before the split. Each partner receives their percentage of the net amount.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Link href="/organizer/payment-settings">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              onClick={handleSave} 
              disabled={!isValid || isSaving}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Split Configuration
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}