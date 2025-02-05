'use client';

import { useState } from 'react';

export default function DutchSealedBidPage() {
  const [currentPrice, setCurrentPrice] = useState<number>(1000);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Dutch Sealed Bid Auction</h1>
      
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Current Price</h2>
          <p className="text-2xl text-green-600">${currentPrice.toLocaleString()}</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="bid" className="block text-sm font-medium text-gray-700">
                Your Bid Amount
              </label>
              <input
                type="number"
                id="bid"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your bid"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Bid
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-4">
              Your bid of ${Number(bidAmount).toLocaleString()} has been submitted!
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              Submit Another Bid
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
