export default function CSSTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">CSS Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tailwind CSS Test</h2>
          <p className="text-gray-600 mb-4">If you can see styled text and colors, Tailwind is working.</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-500 text-white p-4 rounded">Blue Box</div>
            <div className="bg-green-500 text-white p-4 rounded">Green Box</div>
            <div className="bg-red-500 text-white p-4 rounded">Red Box</div>
          </div>
        </div>
        
        <div className="bg-yellow-100 border-2 border-yellow-400 p-4 rounded-lg">
          <p className="text-yellow-800">
            <strong>Status:</strong> If this has a yellow background and border, CSS is working!
          </p>
        </div>
      </div>
    </div>
  );
}