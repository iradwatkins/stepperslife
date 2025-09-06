export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">Event Ticket Refunds</h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p>
                Refund policies are set by individual event organizers. Please check the specific 
                event page for refund information.
              </p>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mt-6">General Guidelines:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Refund requests must be made before the event date</li>
                <li>Processing fees may be non-refundable</li>
                <li>Event organizers have final say on refund approvals</li>
                <li>Cancelled events are eligible for full refunds</li>
              </ul>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mt-6">How to Request a Refund:</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact the event organizer directly through the event page</li>
                <li>Provide your ticket confirmation number</li>
                <li>Explain your reason for requesting a refund</li>
                <li>Allow 5-7 business days for processing</li>
              </ol>
              
              <p className="mt-6 text-sm">
                For additional assistance, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}