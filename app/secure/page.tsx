import { Shield, Lock, CreditCard, CheckCircle } from "lucide-react";

export default function SecurePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Shield className="w-8 h-8 mr-3 text-green-600" />
          Secure Purchase
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="space-y-6">
            <div className="flex items-start">
              <Lock className="w-6 h-6 mr-3 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">SSL Encrypted</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All transactions are protected with industry-standard SSL encryption.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CreditCard className="w-6 h-6 mr-3 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Secure Payment Processing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We use trusted payment processors including Square, PayPal, and Cash App Pay.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 mr-3 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">PCI Compliant</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our payment systems meet all PCI DSS requirements for secure card processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}