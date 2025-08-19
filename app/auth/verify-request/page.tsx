import { Mail } from "lucide-react";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        
        <p className="text-gray-600 mb-6">
          A sign in link has been sent to your email address. 
          Click the link in the email to sign in to your account.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">Didn't receive the email?</p>
          <ul className="text-left space-y-1 text-xs">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email</li>
            <li>• Wait a few moments and try again</li>
          </ul>
        </div>
        
        <a 
          href="/auth/signin" 
          className="inline-block mt-6 text-sm text-blue-600 hover:underline"
        >
          Back to sign in
        </a>
      </div>
    </div>
  );
}