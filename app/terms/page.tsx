export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
          <p>
            <strong>Effective Date:</strong> January 1, 2025
          </p>
          
          <p>
            Welcome to SteppersLife. By using our website and services, you agree to these Terms of Service. 
            Please read them carefully.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using SteppersLife, you agree to be bound by these Terms of Service and all 
            applicable laws and regulations. If you do not agree with any of these terms, you are prohibited 
            from using our services.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Use of Services</h2>
          <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Account Registration</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining account security</li>
            <li>You must be at least 18 years old to create an account</li>
            <li>One person may not maintain multiple accounts</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Prohibited Uses</h3>
          <p>You may not:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Use the service for any illegal purpose</li>
            <li>Resell tickets above face value where prohibited</li>
            <li>Create fake events or fraudulent listings</li>
            <li>Interfere with the proper functioning of the service</li>
            <li>Attempt to gain unauthorized access to our systems</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Ticket Purchases</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>All ticket sales are final unless the event is cancelled</li>
            <li>Platform fee of $1.50 per ticket is non-refundable</li>
            <li>Tickets are delivered electronically via email or app</li>
            <li>You must present valid ticket (QR code or confirmation) for entry</li>
            <li>Duplicate tickets may be voided without refund</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Event Organizers</h2>
          <p>If you are an event organizer:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>You must provide accurate event information</li>
            <li>You are responsible for hosting the event as advertised</li>
            <li>You must comply with all local laws and regulations</li>
            <li>SteppersLife retains the platform fee from ticket sales</li>
            <li>Payouts are processed within 5-7 business days after the event</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Refunds and Cancellations</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Event cancellations: Full refund minus platform fee</li>
            <li>Event postponement: Tickets valid for new date or refund option</li>
            <li>No refunds for no-shows or change of mind</li>
            <li>Refund requests must be submitted before the event date</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Intellectual Property</h2>
          <p>
            All content on SteppersLife, including text, graphics, logos, and software, is the property 
            of SteppersLife or its content suppliers and is protected by copyright and other intellectual 
            property laws.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Disclaimer of Warranties</h2>
          <p>
            SteppersLife is provided "as is" without warranties of any kind. We do not guarantee that the 
            service will be uninterrupted or error-free. We are not responsible for the conduct of event 
            organizers or attendees.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            SteppersLife shall not be liable for any indirect, incidental, special, or consequential damages 
            arising from your use of the service. Our total liability shall not exceed the amount paid by you 
            for the specific service in question.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">9. Indemnification</h2>
          <p>
            You agree to indemnify and hold SteppersLife harmless from any claims, damages, or expenses 
            arising from your use of the service or violation of these terms.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be effective 
            immediately upon posting. Your continued use of the service constitutes acceptance of the 
            modified terms.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">11. Governing Law</h2>
          <p>
            These Terms of Service are governed by the laws of the State of Georgia, United States, without 
            regard to its conflict of law provisions.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">12. Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at:
            <br />
            Email: legal@stepperslife.com
            <br />
            Address: SteppersLife, Atlanta, GA
          </p>
        </div>
      </div>
    </div>
  );
}