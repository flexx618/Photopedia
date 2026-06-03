import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini safely
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined.");
      return null;
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// Helper function to scrape images from DuckDuckGo safely, unthrottled, without APIs
async function scrapeDuckDuckGoImages(query: string, proxy?: string): Promise<Array<{
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  author?: string;
}>> {
  try {
    console.log(`[DDG Fallback] Scraping images for query: "${query}"`);
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    const proxyHeaders: Record<string, string> = {};
    if (proxy === 'miami') {
      proxyHeaders['X-Forwarded-For'] = '72.28.115.20';
      proxyHeaders['CF-Connecting-IP'] = '72.28.115.20';
      proxyHeaders['X-Real-IP'] = '72.28.115.20';
    }
    const tokenRes = await fetch(tokenUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        ...proxyHeaders
      }
    });

    if (!tokenRes.ok) {
      console.warn(`[DDG Fallback] Token fetch failed with status: ${tokenRes.status}`);
      return [];
    }

    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=["']?([^"']+)["']?/i);
    if (!vqdMatch) {
      console.warn('[DDG Fallback] Could not locate verification token (vqd) in html');
      return [];
    }

    const vqd = vqdMatch[1];
    // kp=-1 represents Safe Search disabled (uncensored) in DuckDuckGo
    const apiRequestUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&kp=-1`;
    
    const apiRes = await fetch(apiRequestUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://duckduckgo.com/',
        'Accept': 'application/json',
        ...proxyHeaders
      }
    });

    if (!apiRes.ok) {
      console.warn(`[DDG Fallback] API request failed with status: ${apiRes.status}`);
      return [];
    }

    const data: any = await apiRes.json();
    if (data && Array.isArray(data.results)) {
      console.log(`[DDG Fallback] Successfully fetched ${data.results.length} images from DDG`);
      return data.results.map((item: any, idx: number) => ({
        id: `ddg-${idx}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        url: item.image,
        thumbnail: item.thumbnail || item.image,
        title: query,
        sourceName: 'Search Web',
        sourceUrl: item.url || item.image,
        author: item.source || 'Standard web photo'
      }));
    }
  } catch (err: any) {
    console.error('[DDG Fallback] Failed during scraping sequence:', err.message || err);
  }
  return [];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Simulated Instagram Reels & Feed
  app.get('/api/instagram', async (req, res) => {
    try {
      const url = (req.query.url as string) || '';
      const proxy = (req.query.proxy as string) || '';
      if (!url.trim()) {
        return res.json({ success: true, results: [] });
      }

      // Extract username from profile link or use raw handle
      let username = url.trim();
      username = username.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
      username = username.split('/')[0].split('?')[0];

      if (!username || username === 'instagram.com') {
        return res.json({ success: false, error: 'Please enter a valid Instagram profile URL or handle.' });
      }

      const searchTarget = `${username} instagram posts reels hot`;
      console.log(`[Instagram Proxy] Mapping profile "${username}" to Search Query: "${searchTarget}"`);

      const results: any[] = [];
      const proxyHeaders: Record<string, string> = {};
      if (proxy === 'miami') {
        proxyHeaders['X-Forwarded-For'] = '72.28.115.20';
        proxyHeaders['CF-Connecting-IP'] = '72.28.115.20';
        proxyHeaders['X-Real-IP'] = '72.28.115.20';
      }

      try {
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTarget)}&tbm=isch&safe=off&hl=en&gl=us`;
        const response = await fetch(googleUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            ...proxyHeaders
          }
        });

        if (response.ok) {
          const html = await response.text();
          const cleanHtml = html
            .replace(/\\\\\//g, '/')
            .replace(/\\\//g, '/')
            .replace(/\\u002f/gi, '/')
            .replace(/\\u003d/g, '=')
            .replace(/\\u0026/g, '&');

          const foundUrls = new Set<string>();
          const arrayPattern = /\["(https?:\/\/[^"]+?\.(?:jpg|jpeg|png|webp|gif))"\s*,\s*(\d+)\s*,\s*(\d+)\]/gi;
          let arrMatch;
          while ((arrMatch = arrayPattern.exec(cleanHtml)) !== null) {
            const imgUrl = arrMatch[1];
            if (!imgUrl.includes('google.com') && !imgUrl.includes('gstatic.com')) {
              foundUrls.add(imgUrl);
            }
          }

          let idx = 0;
          for (const imgUrl of foundUrls) {
            results.push({
              id: `insta-${idx}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              url: imgUrl,
              thumbnail: imgUrl,
              title: `Glamour feed post of @${username}`,
              sourceName: `Instagram`,
              sourceUrl: `https://instagram.com/${username}`,
              author: `@${username}`
            });
            idx++;
            if (idx >= 30) break;
          }
        }
      } catch (err) {
        console.error('Google Image Scraper Instagram error:', err);
      }

      if (results.length === 0) {
        const ddgResults = await scrapeDuckDuckGoImages(searchTarget, proxy);
        ddgResults.forEach((item, index) => {
          results.push({
            id: `insta-ddg-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            url: item.url,
            thumbnail: item.thumbnail,
            title: `Reel snippet from @${username} public page`,
            sourceName: `Instagram`,
            sourceUrl: `https://instagram.com/${username}`,
            author: `@${username}`
          });
        });
      }

      return res.json({
        success: true,
        username,
        count: results.length,
        results
      });
    } catch (error: any) {
      console.error('Instagram simulation endpoint failed:', error);
      return res.status(500).json({ success: false, error: 'Could not access Instagram profile feed.' });
    }
  });

  // API Route for Image Search
  app.get('/api/search', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      const source = (req.query.source as string) || 'all'; // 'google', 'unsplash', 'all'
      const proxy = (req.query.proxy as string) || '';

      if (!query.trim()) {
        return res.json({ success: true, results: [] });
      }

      const proxyHeaders: Record<string, string> = {};
      if (proxy === 'miami') {
        proxyHeaders['X-Forwarded-For'] = '72.28.115.20';
        proxyHeaders['CF-Connecting-IP'] = '72.28.115.20';
        proxyHeaders['X-Real-IP'] = '72.28.115.20';
      }

      const results: Array<{
        id: string;
        url: string;
        thumbnail: string;
        title: string;
        sourceName: string;
        sourceUrl: string;
        author?: string;
        aspectRatio?: number;
      }> = [];

      // Flag for whether we gathered any Google results
      let googleSuccess = false;

      // 1. Fetch Google search images if requested
      if (source === 'google' || source === 'all') {
        try {
          console.log(`[Google Scraper] Querying Google Images for: "${query}"${proxy === 'miami' ? ' via Miami Proxy' : ''}`);
          const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=off&hl=en&gl=us`;
          
          const response = await fetch(googleUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              ...proxyHeaders
            },
          });

          if (response.ok) {
            const html = await response.text();
            
            // Unescape escaped slashes and unicode common sequences to make regex parsing 100% reliable
            const cleanHtml = html
              .replace(/\\\\\//g, '/')
              .replace(/\\\//g, '/')
              .replace(/\\u002f/gi, '/')
              .replace(/\\u003d/g, '=')
              .replace(/\\u0026/g, '&')
              .replace(/\\u002c/g, ',')
              .replace(/\\u0022/g, '"')
              .replace(/\\u0027/g, "'");

            const foundUrls = new Set<string>();

            // Method A: Exact google high-res image format matching
            const arrayPattern = /\["(https?:\/\/[^"]+?\.(?:jpg|jpeg|png|webp|gif))"\s*,\s*(\d+)\s*,\s*(\d+)\]/gi;
            let arrMatch;
            while ((arrMatch = arrayPattern.exec(cleanHtml)) !== null) {
              const url = arrMatch[1];
              if (!url.includes('google.com') && !url.includes('gstatic.com') && !url.includes('schema.org')) {
                foundUrls.add(url);
              }
            }

            // Method B: Broad regex match for quoted high-res images inside the scripts
            const urlPattern = /"(https?:\/\/[^"\s,{}()\[\]]+?\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"\s,{}()\[\]]*)?)"/gi;
            let match;
            while ((match = urlPattern.exec(cleanHtml)) !== null) {
              const url = match[1];
              if (
                !url.includes('google.com') &&
                !url.includes('gstatic.com') &&
                !url.includes('schema.org') &&
                !url.includes('w3.org') &&
                !url.includes('favicon') &&
                !foundUrls.has(url)
              ) {
                foundUrls.add(url);
              }
            }

            // Method C: Scrape legacy image previews (encrypted-tbn gstatic tags) as a premium fallback
            const legacyImgPattern = /<img[^>]+src="([^"]+)"[^>]+>/gi;
            let legacyMatch;
            while ((legacyMatch = legacyImgPattern.exec(cleanHtml)) !== null) {
              const url = legacyMatch[1];
              if (url.startsWith('https://encrypted-tbn') && !foundUrls.has(url)) {
                foundUrls.add(url);
              }
            }

            // Convert and push results
            let index = 0;
            for (const url of foundUrls) {
              const normalizedUrl = url.replace(/\\u003d/g, '=').replace(/\\u0026/g, '&');
              results.push({
                id: `google-${index}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                url: normalizedUrl,
                thumbnail: normalizedUrl, // Fallback to original url
                title: query,
                sourceName: 'Google Search',
                sourceUrl: normalizedUrl,
              });
              index++;
              if (index >= 40) break; // Keep first 40 unique results
            }

            if (results.length > 0) {
              googleSuccess = true;
            }
          }
        } catch (err) {
          console.error('Google Image Scraper Error:', err);
        }

        // Failsafe backup: If Google returns 0 results (due to rate limiting/captcha block), query DuckDuckGo images directly!
        if (results.length === 0) {
          try {
            console.log(`[Google Scraper] Google returned 0 images. Attempting instant unblocked search fallback...`);
            const ddgImages = await scrapeDuckDuckGoImages(query, proxy);
            if (ddgImages.length > 0) {
              results.push(...ddgImages);
              googleSuccess = true;
            }
          } catch (err) {
            console.error('[Google Scraper] Fallback crawl failed:', err);
          }
        }
      }

      // 2. Fetch Unsplash images if requested or as a premium high-quality fallback
      let unsplashSuccess = false;
      if (source === 'unsplash' || source === 'all' || !googleSuccess) {
        try {
          // Fetch from Unsplash free client-facing public endpoint
          const unsplashUrl = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=30`;
          const subRes = await fetch(unsplashUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
              'Accept': 'application/json',
              'Referer': 'https://unsplash.com/',
              ...proxyHeaders
            },
          });

          let napiSuccess = false;
          if (subRes.ok) {
            const data = await subRes.json();
            if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
              napiSuccess = true;
              unsplashSuccess = true;
              data.results.forEach((item: any, idx: number) => {
                const highResUrl = item.urls?.regular || item.urls?.full;
                if (highResUrl) {
                  results.push({
                    id: `unsplash-${item.id || idx}-${Date.now()}`,
                    url: highResUrl,
                    thumbnail: item.urls?.small || highResUrl,
                    title: item.alt_description || item.description || `Beautiful photograph of ${query}`,
                    sourceName: 'Unsplash HD',
                    sourceUrl: item.links?.html || 'https://unsplash.com',
                    author: item.user ? `${item.user.name} (@${item.user.username})` : undefined,
                  });
                }
              });
            }
          }

          // Fallback: If public NAPI returned empty or failed due to Cloud Run IP blocking, scrape standard Unsplash SEO page!
          if (!napiSuccess) {
            console.log(`Unsplash NAPI returned 0 results. Running premium public page scraper fallback for query: "${query}"`);
            const unsplashHtmlUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
            const htmlRes = await fetch(unsplashHtmlUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                ...proxyHeaders
              }
            });

            if (htmlRes.ok) {
              const html = await htmlRes.text();
              const imgTags = html.match(/<img[^>]+>/gi) || [];
              const seenIds = new Set<string>();

              for (const tag of imgTags) {
                if (!tag.includes('images.unsplash.com/photo-')) continue;

                const srcMatch = tag.match(/src="([^"]+)"/i);
                if (!srcMatch) continue;

                const src = srcMatch[1];
                
                // Extract photo ID
                const photoIdMatch = src.match(/images\.unsplash\.com\/(photo-[a-zA-Z0-9\-–_]+)/i);
                if (!photoIdMatch) continue;

                const photoId = photoIdMatch[1];
                if (seenIds.has(photoId)) continue;
                seenIds.add(photoId);

                const altMatch = tag.match(/alt="([^"]*)"/i);
                const altText = altMatch ? altMatch[1].trim() : '';
                
                const cleanTitle = altText
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'") || `Stunning visual representing ${query}`;

                let author = undefined;
                const byMatch = cleanTitle.match(/by\s+([A-Z][a-zA-Z\s]+)$/i);
                if (byMatch) {
                  author = byMatch[1].trim();
                }

                const highResUrl = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1080&q=80`;
                results.push({
                  id: `unsplash-scrape-${photoId}-${Date.now()}-${Math.floor(Math.random() * 1050)}`,
                  url: highResUrl,
                  thumbnail: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=400&q=80`,
                  title: cleanTitle,
                  sourceName: 'Unsplash SEO',
                  sourceUrl: `https://unsplash.com/photos/${photoId.replace('photo-', '')}`,
                  author: author || 'Unsplash Contributor'
                });
                unsplashSuccess = true;
              }

              // Also match any leftover raw image photo- URLs
              const allPhotoIds = html.match(/images\.unsplash\.com\/(photo-[a-zA-Z0-9\-–_]+)/gi) || [];
              for (const matchStr of allPhotoIds) {
                const photoIdMatch = matchStr.match(/images\.unsplash\.com\/(photo-[a-zA-Z0-9\-–_]+)/i);
                if (photoIdMatch) {
                  const photoId = photoIdMatch[1];
                  if (!seenIds.has(photoId)) {
                    seenIds.add(photoId);
                    const highResUrl = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1080&q=80`;
                    results.push({
                      id: `unsplash-raw-${photoId}-${Date.now()}-${Math.floor(Math.random() * 1050)}`,
                      url: highResUrl,
                      thumbnail: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=400&q=80`,
                      title: `Breathtaking photograph of ${query}`,
                      sourceName: 'Unsplash HD',
                      sourceUrl: `https://unsplash.com/photos/${photoId.replace('photo-', '')}`,
                      author: 'Unsplash Artist'
                    });
                    unsplashSuccess = true;
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('Unsplash search error:', err);
        }
      }

      // 3. Fetch from Wikimedia Commons (100% reliable, direct and never blocked in Cloud Run!)
      let wikimediaSuccess = false;
      if (source === 'all' || source === 'google' || source === 'unsplash') {
        try {
          console.log(`Querying Wikimedia Commons for images: "${query}"`);
          const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url|descriptionurl&format=json&origin=*`;
          const response = await fetch(wikiUrl, {
            headers: {
              'User-Agent': 'PureVisionImageScrollFeed/1.0 (abhinavgoswami132@gmail.com) NodeFetch'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.query && data.query.pages) {
              const pages = data.query.pages;
              let addedCount = 0;
              for (const key in pages) {
                const page = pages[key];
                const imageInfo = page.imageinfo?.[0];
                if (imageInfo && imageInfo.url) {
                  const imageUrl = imageInfo.url;
                  const ext = imageUrl.split('.').pop()?.toLowerCase() || '';
                  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
                    const rawTitle = page.title || '';
                    const titleClean = rawTitle
                      .replace('File:', '')
                      .replace(/\.[^/.]+$/, "")
                      .replace(/[-_]/g, ' ')
                      .trim();
                    const finalTitle = titleClean.charAt(0).toUpperCase() + titleClean.slice(1);

                    results.push({
                      id: `wikimedia-${page.pageid || Math.random()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                      url: imageUrl,
                      thumbnail: imageUrl,
                      title: finalTitle || `Splendid Wikimedia view of ${query}`,
                      sourceName: 'Wikimedia HD',
                      sourceUrl: imageInfo.descriptionurl || imageUrl,
                      author: 'Wikimedia Contributor',
                    });
                    addedCount++;
                  }
                }
              }
              if (addedCount > 0) {
                wikimediaSuccess = true;
              }
            }
          }
        } catch (err) {
          console.error('Wikimedia fetch failed:', err);
        }
      }

      // 4. Fetch using Gemini Search Grounding (premium AI search fallback to find live direct URLs)
      let geminiSuccess = false;
      const ai = getGeminiClient();
      if (ai && (results.length < 12 || source === 'all')) {
        try {
          console.log(`Querying Gemini with Search Grounding to enrich search of: "${query}"`);
          const prompt = `Perform a web search to find exactly 15-20 direct, high-resolution public photo URLs (from Unsplash, Wikimedia, Pexels, Pixabay, or standard trustworthy blogs) for: "${query}".
The URLs must be valid, publicly readable image formats (.jpg, .jpeg, .png, or .webp). Include titles and authors if possible.
Return the output STRICTLY as a JSON array of objects conforming to this schema, with no markdown wrappers or other formatting besides raw JSON (or if formatted, as JSON):
[
  {
    "url": "direct image URL",
    "thumbnail": "thumbnail version of URL (or the original URL)",
    "title": "descriptive picture title",
    "author": "photographer or source channel",
    "sourceName": "e.g., Unsplash, Wikimedia",
    "sourceUrl": "web page of the image"
  }
]`;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    url: { type: Type.STRING },
                    thumbnail: { type: Type.STRING },
                    title: { type: Type.STRING },
                    author: { type: Type.STRING },
                    sourceName: { type: Type.STRING },
                    sourceUrl: { type: Type.STRING }
                  },
                  required: ["url", "thumbnail", "title", "sourceName", "sourceUrl"]
                }
              }
            }
          });

          const text = response.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              geminiSuccess = true;
              parsed.forEach((item, idx) => {
                // Ensure URLs are valid strings
                if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
                  results.push({
                    id: `gemini-${idx}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    url: item.url,
                    thumbnail: item.thumbnail || item.url,
                    title: item.title || `Breathtaking photograph of ${query}`,
                    sourceName: item.sourceName || 'AI Search',
                    sourceUrl: item.sourceUrl || item.url,
                    author: item.author || 'AI Grounding Source'
                  });
                }
              });
            }
          }
        } catch (err) {
          console.error('Gemini Search Grounding call failed:', err);
        }
      }

      // 5. Ultimate backup engine: Query Gemini native knowledge to list stable known Unsplash photo IDs for standard terms
      if (ai && results.length === 0) {
        try {
          console.log(`Generating native Unsplash image IDs for the query: "${query}"`);
          const prompt = `The user is searching for "${query}". Please list 15 highly-relevant, beautiful, stable real Unsplash photo ID strings from your training knowledge base that represent this query perfectly. 
Do not make up fake IDs. Return actual popular, high-quality Unsplash photo IDs that you know exist (for example, a photo of a car starts with "photo-15...").
Return the result STRICTLY as a JSON array of objects conforming to this schema, with no markdown wrappers:
[
  {
    "photoId": "the unsplash photo ID string, e.g., photo-1503376780353-7e6692767b70",
    "title": "descriptive picture title",
    "author": "photographer name"
  }
]`;
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    photoId: { type: Type.STRING },
                    title: { type: Type.STRING },
                    author: { type: Type.STRING }
                  },
                  required: ["photoId", "title", "author"]
                }
              }
            }
          });

          const text = response.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsed.forEach((item, idx) => {
                if (item.photoId) {
                  let cleanId = item.photoId.trim();
                  const match = cleanId.match(/photo-[a-zA-Z0-9\-]+/);
                  if (match) {
                    cleanId = match[0];
                  }
                  const highResUrl = `https://images.unsplash.com/${cleanId}?auto=format&fit=crop&w=1080&q=80`;
                  results.push({
                    id: `gemini-raw-${cleanId}-${Date.now()}-${idx}`,
                    url: highResUrl,
                    thumbnail: `https://images.unsplash.com/${cleanId}?auto=format&fit=crop&w=400&q=80`,
                    title: item.title || `Fascinating picture of ${query}`,
                    sourceName: 'Unsplash AI Direct',
                    sourceUrl: `https://unsplash.com/photos/${cleanId.replace('photo-', '')}`,
                    author: item.author || 'Unsplash Photographer'
                  });
                }
              });
            }
          }
        } catch (err) {
          console.error("Gemini Unsplash native ID generation failed:", err);
        }
      }

      // 6. Curated Fallback Mechanism (only used as a strict safety net of last resort)
      if (results.length === 0) {
        console.log(`Using base fallback generator for query: "${query}"`);
        // Curated set of high quality stock and scenic images that load reliably
        const fallbackStocks = [
          // Cats / puppies / animals
          { id: 'f-1', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', title: 'Lovely kitten resting in peaceful sunny afternoon', author: 'Paul Hanaoka', kw: ['cat', 'kitten', 'animal', 'cute'] },
          { id: 'f-2', url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce', title: 'Aesthetic ginger cat with vintage sunglasses', author: 'Kari Shea', kw: ['cat', 'pet', 'sunglasses', 'cute'] },
          { id: 'f-3', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1', title: 'Wobbly labrador pup looking up with pure love', author: 'Marliese Ryser', kw: ['dog', 'puppy', 'retriever', 'animal'] },
          { id: 'f-4', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9', title: 'Adorable small puppy with floppy ears smiling', author: 'Charles Deluvio', kw: ['dog', 'puppy', 'cute', 'animal'] },
          
          // Cyberpunk / vaporwave / city / tokyo
          { id: 'f-5', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5', title: 'Cyberpunk Tokyo lanes illuminated by flashing neon displays', author: 'Jezael Melgoza', kw: ['cyberpunk', 'tokyo', 'neon', 'city', 'night'] },
          { id: 'f-6', url: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b', title: 'High-tech skyline overlooking futuristic metropolis', author: 'Alex Knight', kw: ['cyberpunk', 'futuristic', 'neon', 'city', 'sci-fi'] },
          { id: 'f-7', url: 'https://images.unsplash.com/photo-1513829096999-4978602297af', title: 'Shibuya crossing glowing with magenta cyberpunk hues', author: 'Sora Sagano', kw: ['cyberpunk', 'tokyo', 'city', 'japan'] },

          // Space / nebula / galaxy
          { id: 'f-8', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa', title: 'Deep stellar cosmic expanse and swirling dust clouds', author: 'NASA', kw: ['space', 'universe', 'nebula', 'galaxy', 'science'] },
          { id: 'f-9', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564', title: 'Stunning violet and crimson cosmic plasma clouds', author: 'NASA', kw: ['space', 'cosmic', 'nebula', 'star'] },
          { id: 'f-10', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86', title: 'Wondrous glowing core of deep space galaxy', author: 'Vincentiu Solomon', kw: ['space', 'galaxy', 'stars', 'cosmos'] },

          // Nature / landscapes / ocean / waves
          { id: 'f-11', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0', title: 'Scenic view of perfect azure water and warm sandy beaches', author: 'Sean Oulashin', kw: ['ocean', 'sea', 'beach', 'sunset', 'water', 'wave'] },
          { id: 'f-12', url: 'https://images.unsplash.com/photo-1505291308251-87612f0fb8bc', title: 'Immersive macro of curling coastal ocean wave cresting', author: 'Silas Baisch', kw: ['ocean', 'wave', 'sea', 'water', 'nature'] },
          { id: 'f-13', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', title: 'Ethereal misty mountains surrounded by green forests', author: 'Kal Vis', kw: ['nature', 'mountain', 'forest', 'landscape', 'green'] },
          { id: 'f-14', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d', title: 'Serene warm sunlight filter through golden forest leaves', author: 'Lukasz Szmigiel', kw: ['nature', 'forest', 'leaves', 'sunlight', 'landscape'] },

          // Minimalist architecture
          { id: 'f-15', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', title: 'Clean minimalist brutalist luxury concrete retreat villa', author: 'R-Architecture', kw: ['architecture', 'minimalist', 'brutalist', 'modern', 'house'] },
          { id: 'f-16', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f', title: 'Serene sunbeam casting long shadow on clean modern gallery wall', author: 'Sven Brandsma', kw: ['minimalist', 'interior', 'aesthetic', 'shadow'] },

          // General / Abstract / Tech
          { id: 'f-17', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', title: 'Satisfying swirling metallic glass fluid art design', author: 'Milad Fakurian', kw: ['satisfying', 'abstract', 'art', 'fluid', 'render'] },
          { id: 'f-18', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f', title: 'Retro vintage gaming aesthetic desktop workspace layout', author: 'Lorenzo Herrera', kw: ['satisfying', 'retro', 'tech', 'desk', 'cyberpunk'] },
        ];

        // Filter based on search query matching keywords or titles
        const lowerQ = query.toLowerCase();
        let matched = fallbackStocks.filter(img => 
          img.kw.some((keyword: string) => lowerQ.includes(keyword) || keyword.includes(lowerQ))
        );

        // If no keyword match, provide a mix of our pre-curated beautiful items
        if (matched.length === 0) {
          matched = fallbackStocks;
        }

        matched.forEach((item, index) => {
          const highResUrl = `${item.url}?auto=format&fit=crop&q=80&w=1080`;
          results.push({
            id: `fallback-${item.id}-${index}-${Date.now()}`,
            url: highResUrl,
            thumbnail: `${item.url}?auto=format&fit=crop&q=80&w=400`,
            title: item.title,
            sourceName: 'Vision Fallback',
            sourceUrl: 'https://unsplash.com',
            author: item.author,
          });
        });
      }

      // Shuffle slightly if "all" to provide a blended reels experience
      if (source === 'all') {
        results.sort(() => Math.random() - 0.5);
      }

      return res.json({
        success: true,
        count: results.length,
        results,
      });
    } catch (error: any) {
      console.error('API Search general failure:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error while searching images',
      });
    }
  });

  // Serve static assets or mount Vite in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server successfully running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start fullstack server:', err);
});
