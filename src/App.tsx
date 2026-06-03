/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Image as ImageIcon } from 'lucide-react';
import ReelsFeed from './components/ReelsFeed';
import { SearchResultImage, SearchSource } from './types';

export default function App() {
  const [initialImages, setInitialImages] = useState<SearchResultImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Perform search query wrapper reaching Express server
  const handleQuerySearch = async (query: string, source: SearchSource, proxyEnabled?: boolean): Promise<SearchResultImage[]> => {
    try {
      const isProxy = proxyEnabled ? 'miami' : '';
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&source=${source}&proxy=${isProxy}`);
      if (!response.ok) {
        throw new Error(`Search request failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.success && Array.isArray(data.results)) {
        return data.results;
      } else {
        throw new Error(data.error || 'Failed to retrieve pictures from the search engine');
      }
    } catch (err: any) {
      console.error('Error fetching images:', err);
      throw err;
    }
  };

  // Perform Instagram reels extraction reaching Express server
  const handleInstagramSearch = async (url: string, proxyEnabled?: boolean): Promise<SearchResultImage[]> => {
    try {
      const isProxy = proxyEnabled ? 'miami' : '';
      const response = await fetch(`/api/instagram?url=${encodeURIComponent(url)}&proxy=${isProxy}`);
      if (!response.ok) {
        throw new Error(`Instagram server request failed with status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.success && Array.isArray(data.results)) {
        return data.results;
      } else {
        throw new Error(data.error || 'Failed to fetch Instagram posts feed');
      }
    } catch (err: any) {
      console.error('Error fetching Instagram posts:', err);
      throw err;
    }
  };

  // On mount, perform initial search for "cat" as requested by the user
  useEffect(() => {
    let active = true;

    async function loadInitial() {
      try {
        setLoading(true);
        // Default search: 'cat'
        const results = await handleQuerySearch('cat', 'all');
        if (active) {
          setInitialImages(results);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Unable to connect to the backend image search api.');
          setLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div id="app-loading-screen" className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 font-sans select-none">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-red-500/10 border-t-red-600 animate-spin" />
          <Compass className="w-8 h-8 text-white absolute inset-0 m-auto animate-pulse" />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white mb-1.5 animate-pulse">Initializing Reels Feed</h2>
        <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase">Loading first search topic (cat)...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div id="app-error-screen" className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-100 font-sans">
        <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-2xl max-w-md space-y-4">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto text-white">
            <span className="text-xl font-bold">!</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Application Connection Failed</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono">
              {error}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs py-2 px-4 rounded-full font-semibold transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="app-viewport-root" className="w-screen h-screen">
      <ReelsFeed 
        initialImages={initialImages} 
        onSearch={handleQuerySearch} 
        onLoadInstagram={handleInstagramSearch}
      />
    </div>
  );
}
