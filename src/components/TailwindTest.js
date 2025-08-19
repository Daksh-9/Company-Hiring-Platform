import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-8 bg-blue-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this styled component, Tailwind CSS is working correctly!
        </p>
        <div className="space-y-2">
          <div className="bg-green-100 text-green-800 p-3 rounded">
            ✅ Green success message
          </div>
          <div className="bg-blue-100 text-blue-800 p-3 rounded">
            ℹ️ Blue info message
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded">
            ⚠️ Yellow warning message
          </div>
          <div className="bg-red-100 text-red-800 p-3 rounded">
            ❌ Red error message
          </div>
        </div>
        <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Test Button
        </button>
      </div>
    </div>
  );
};

export default TailwindTest;
