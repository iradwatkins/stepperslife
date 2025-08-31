export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About SteppersLife</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            SteppersLife is your premier destination for discovering and attending the best stepping events, 
            workshops, and social dances in your area. We connect dance enthusiasts with event organizers 
            to create unforgettable experiences.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            To bring the stepping community together by providing a seamless platform for event discovery, 
            ticket purchasing, and community engagement. We believe in the power of dance to unite people 
            and create lasting memories.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">What We Offer</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
            <li>Easy event discovery and browsing</li>
            <li>Secure ticket purchasing with multiple payment options</li>
            <li>QR code tickets for contactless entry</li>
            <li>Event management tools for organizers</li>
            <li>Multi-day event support with bundle pricing</li>
            <li>Table and group ticket sales</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            Have questions or feedback? We'd love to hear from you!<br />
            Email: <a href="mailto:support@stepperslife.com" className="text-purple-600 hover:underline">support@stepperslife.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}