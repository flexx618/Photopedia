import React, { useState, useEffect, useRef, useTransition } from 'react';
import { 
  Search, 
  Sparkles, 
  Play, 
  Pause, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2, 
  Image as ImageIcon,
  Globe, 
  Download, 
  User, 
  Info,
  X,
  VolumeX,
  Compass,
  ArrowRight,
  TrendingUp,
  Instagram,
  Wifi,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SearchResultImage, FeedMode, SearchSource, SearchCategory } from '../types';

interface ReelsFeedProps {
  initialImages: SearchResultImage[];
  onSearch: (query: string, source: SearchSource, proxyEnabled?: boolean) => Promise<SearchResultImage[]>;
  onLoadInstagram: (url: string, proxyEnabled?: boolean) => Promise<SearchResultImage[]>;
}

const CATEGORIES: SearchCategory[] = [
  { id: '1', label: 'Cute Cats', query: 'cat', icon: '🐱' },
  { id: '2', label: 'Neon Cyberpunk', query: 'cyberpunk tokyo city', icon: '🌆' },
  { id: '3', label: 'Aesthetic Space', query: 'cosmic nebula spacescape', icon: '🌌' },
  { id: '4', label: 'Ocean Waves', query: 'ocean drone photography high res', icon: '🌊' },
  { id: '5', label: 'Minimal Architecture', query: 'brutalist modern architecture minimalist', icon: '🏛️' },
  { id: '6', label: 'Cute Puppies', query: 'golden retriever puppies', icon: '🐶' },
  { id: '7', label: 'Anime Aesthetics', query: 'retro anime landscape background aesthetic', icon: '🌸' },
  { id: '8', label: 'Satisfying Drops', query: 'macro water drop satisfying splash', icon: '💧' },
];

const SPICY_RECOMMENDATIONS = [
  { label: "Sara Ali Khan Hot", query: "sara ali khan hot" },
  { label: "Rakul Preet Singh Sexy", query: "rakul preet singh sexy" },
  { label: "Kiara Advani Bikini", query: "kiara advani in bikini" },
  { label: "Tripti Dimri VS", query: "tripti dimri victoria secret" },
  { label: "Shraddha Kapoor Sexy", query: "shraddha kapoor hot sexy" },
  { label: "Tamannaah Bhat Hot", query: "tamannaah bhat hot" },
  { label: "Disha Patani Bikini", query: "disha patani bikini sexy hot" },
  { label: "Nora Fatehi Hot Dance", query: "nora fatehi hot sexy dance" },
  { label: "Katrina Kaif Hot", query: "katrina kaif hot sexy" },
  { label: "Deepika Padukone Bikini", query: "deepika padukone pathaan bikini" },
  { label: "Janhvi Kapoor Hot", query: "janhvi kapoor hot sexy" },
  { label: "Ananya Panday Hot", query: "ananya panday hot sexy" },
  { label: "Kriti Sanon Hot", query: "kriti sanon hot sexy" },
  { label: "Pooja Hegde Bikini", query: "pooja hegde beachfront bikini" },
  { label: "Samantha Sexy", query: "samantha ruth prabhu hot sexy" },
  { label: "Rashmika Mandanna Hot", query: "rashmika mandanna hot sexy" },
  { label: "Jacqueline Fernandez Hot", query: "jacqueline fernandez hot sexy" },
  { label: "Urvashi Rautela Sexy", query: "urvashi rautela hot bikini sexy" }
];

const VERTICAL_GLAMOUR_REELS = [
  "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-shining-34311-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-with-glowing-neon-makeup-in-dark-34314-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-neon-lit-room-34317-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-smiling-and-posing-40432-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-under-rain-with-umbrella-42251-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-in-studio-41480-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-young-woman-in-sunlight-by-the-ocean-40431-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-sensual-young-woman-with-closed-eyes-40434-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-gorgeous-young-woman-posing-in-front-of-camera-40441-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-model-posing-with-wind-in-her-hair-40443-large.mp4"
];

const injectVideoReels = (results: SearchResultImage[], query: string): SearchResultImage[] => {
  // Returns pristine search result images without injecting unrequested or distracting live test video reels.
  if (!results) return [];
  return results;
};

interface VideoPlayerProps {
  src: string;
  isActive: boolean;
  feedMode: FeedMode;
}

function VideoPlayer({ src, isActive, feedMode }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(err => console.warn('Autoplay prevented:', err));
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted={isMuted}
        className={`transition-all duration-500 ease-out select-none pointer-events-auto shadow-2xl ${
          feedMode === 'fill' 
            ? 'w-full h-full object-cover rounded-none' 
            : 'max-w-full max-h-full object-contain rounded-none md:rounded-2xl border border-zinc-900/40'
        }`}
      />
      
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        className="absolute bottom-4 left-4 z-40 bg-black/60 hover:bg-black/80 border border-zinc-800 text-white rounded-full p-2.5 transition-all shadow-md flex items-center justify-center active:scale-95 cursor-pointer pointer-events-auto"
      >
        {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Play className="w-4 h-4 text-green-500 fill-current" />}
      </button>

      <div className="absolute top-4 left-4 z-40 bg-red-600/90 border border-red-500/80 px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-lg animate-pulse">
        <Sparkles className="w-3 h-3 text-white fill-current" />
        <span className="text-[9px] font-black tracking-widest text-white uppercase font-mono">LIVE REEL</span>
      </div>
    </div>
  );
}

// SIMULATED INSTAGRAM PORTRAIT REELS LIST MAPPER
const getSimulatedInstaReels = (username: string) => {
  const cleanUser = username.replace(/^@/, '');
  const capitalUser = cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1);
  return [
    {
      id: `insta-reel-1-${cleanUser}`,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-shining-34311-large.mp4",
      caption: `Midnight glamour aura ✨ Loving the neon vibe tonight. Always glowing! @${cleanUser} #reels #life #glamour #trending`,
      likes: "824K",
      comments: "4.9K",
      audio: `Original Audio - @${cleanUser} Synth Beats`,
      verified: true
    },
    {
      id: `insta-reel-2-${cleanUser}`,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-with-glowing-neon-makeup-in-dark-34314-large.mp4",
      caption: `Neon dreams & high standards. What's your absolute favorite color? 🔮💜 @${cleanUser} #foryou #style #love #glace`,
      likes: "951K",
      comments: "5.8K",
      audio: `Original Audio - Tokyo Neon Mix`,
      verified: true
    },
    {
      id: `insta-reel-3-${cleanUser}`,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-neon-lit-room-34317-large.mp4",
      caption: `On set BTS of the custom portfolio photoshoot coming up next week! Stay tuned! 📸💃 @${cleanUser} #lifestyle #model #fashion #purevision`,
      likes: "1.2M",
      comments: "9.3K",
      audio: `Original Audio - @${cleanUser} Synthwave Ambient`,
      verified: true
    },
    {
      id: `insta-reel-4-${cleanUser}`,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-smiling-and-posing-40432-large.mp4",
      caption: `Sun kissed & carefree ☀️ Absolute paradise right here. Happy weekend everyone! 🍹🌴 @${cleanUser} #vacation #beauty #carefree`,
      likes: "1.5M",
      comments: "12.4K",
      audio: `Summer Vibes - Acoustic Session`,
      verified: true
    },
    {
      id: `insta-reel-5-${cleanUser}`,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-gorgeous-young-woman-posing-in-front-of-camera-40441-large.mp4",
      caption: `Golden hour glow hits different. So grateful for all your support lately! 🥺❤️ @${cleanUser} #gratitude #love #beauty #glow`,
      likes: "2.1M",
      comments: "18.3K",
      audio: `Sunset Chill Track - @${cleanUser}`,
      verified: true
    },
    {
      id: `insta-reel-6-${cleanUser}`,
      videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-model-posing-with-wind-in-her-hair-40443-large.mp4",
      caption: `Wind in my hair, zero thoughts in my mind. Pure freedom! 🌊✨ #beachvibe @${cleanUser} #instareels #foryou`,
      likes: "740K",
      comments: "3.2K",
      audio: `Ocean Breeze Acoustic - Chill Mix`,
      verified: true
    }
  ];
};

interface InstagramReelCardProps {
  key?: string | number;
  reel: {
    id: string;
    videoUrl: string;
    caption: string;
    likes: string;
    comments: string;
    audio: string;
    verified: boolean;
  };
  username: string;
  isActive: boolean;
  feedMode: FeedMode;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function InstagramReelCard({ reel, username, isActive, feedMode, onPrev, onNext, isFirst, isLast }: InstagramReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().then(() => {
        setPlaying(true);
      }).catch(err => {
        console.warn('Playback prevented', err);
        setPlaying(false);
      });
    } else {
      video.pause();
      setProgress(0);
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const duration = video.duration || 1;
      setProgress((current / duration) * 100);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().then(() => {
        setPlaying(true);
      }).catch(() => {
        setPlaying(false);
      });
    }
  };

  const handleLikeToggle = () => {
    setLiked(!liked);
  };

  return (
    <div 
      className="snap-start w-full h-full flex items-center justify-center relative select-none bg-black overflow-hidden"
      style={{ minHeight: '100vh', height: '100vh' }}
    >
      {/* Background blur */}
      <div className="absolute inset-0 bg-zinc-950/95 z-0 flex items-center justify-center pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl opacity-20" 
        />
      </div>

      {/* Main Video element inside Instagram smartphone container frame */}
      <div className="absolute inset-0 z-11 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full h-full max-w-md bg-zinc-950 border-0 sm:border border-zinc-900 rounded-none sm:rounded-[2rem] overflow-hidden relative shadow-[0_0_50px_rgba(236,72,153,0.15)] flex flex-col justify-between">
          
          {/* Inner Video Container */}
          <div className="absolute inset-0 z-0 bg-black cursor-pointer animate-fade-in" onClick={handlePlayPause}>
            <video
              ref={videoRef}
              src={reel.videoUrl}
              loop
              playsInline
              muted={muted}
              className="w-full h-full object-cover"
            />
          </div>

          {/* PLAY/PAUSE CENTER BLINK ELEMENT */}
          {!playing && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 pointer-events-none">
              <div className="p-5 bg-black/60 rounded-full text-white animate-pulse">
                <Play className="w-8 h-8 fill-current text-white" />
              </div>
            </div>
          )}

          {/* TOP INSTAGRAM LOGO OVERLAY */}
          <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
            <span className="text-xs font-bold tracking-wider text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] uppercase font-mono">Reels</span>
            <span className="text-[10px] text-white/80 font-mono bg-black/40 border border-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-md font-bold uppercase">Sandbox</span>
          </div>

          {/* BOTTOM INTERACTIVE TIMELINE SCROLLER PROGRESS BAR */}
          <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/20 z-30 pointer-events-none">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-r-full" 
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* PANEL UI DETAILS SHADOW */}
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />

          {/* PANEL CONTENT DESCRIPTION - LEFT SIDE */}
          <div className="absolute left-4 bottom-5 right-14 z-20 pointer-events-none flex flex-col space-y-2.5">
            <div className="flex items-center space-x-2 pointer-events-auto">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[2px] flex items-center justify-center shadow-lg">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-[10px] font-bold text-zinc-100 uppercase select-none font-mono">
                  {username.slice(0, 2)}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-white font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">@{username}</span>
                  <span className="bg-blue-500 text-white rounded-full p-0.5 flex items-center justify-center shrink-0 w-3.5 h-3.5 shadow">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </span>
                </div>
                <span className="text-[8px] text-zinc-400 font-mono tracking-widest leading-none font-semibold uppercase">Verified Account</span>
              </div>
            </div>

            <p className="text-xs text-white/95 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] max-h-16 overflow-y-auto font-sans font-light select-text pointer-events-auto pr-1 scrollbar-none">
              {reel.caption}
            </p>

            <div className="flex items-center space-x-2 text-[10px] text-zinc-300 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <span className="animate-pulse text-zinc-400">🎵</span>
              <div className="w-36 overflow-hidden relative">
                <span className="whitespace-nowrap inline-block uppercase tracking-wider text-[9px] text-zinc-300 font-semibold font-mono">
                  {reel.audio}
                </span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE RIGHT ACTIONS OVERLAY - RIGHT SIDE */}
          <div className="absolute right-3.5 bottom-6 z-20 flex flex-col items-center space-y-4 pointer-events-auto">
            
            {/* LIKE BUTTON */}
            <div className="flex flex-col items-center">
              <button 
                onClick={handleLikeToggle}
                className={`w-11 h-11 rounded-full flex items-center justify-center bg-black/40 border border-white/10 backdrop-blur-md transition-all active:scale-90 ${
                  liked 
                    ? 'text-pink-500 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.5)] bg-pink-950/20' 
                    : 'text-white hover:text-pink-400'
                }`}
              >
                <svg viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5.5 h-5.5 transition-transform duration-300">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
              <span className="text-[10px] text-zinc-300 font-mono mt-1 font-bold">{reel.likes}</span>
            </div>

            {/* MUTE SPEAKER CONTROLLER */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => setMuted(!muted)}
                className={`w-11 h-11 rounded-full flex items-center justify-center bg-black/40 border border-white/10 backdrop-blur-md transition-all active:scale-90 ${
                  !muted 
                    ? 'text-emerald-400 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-emerald-950/20' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {muted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-red-400">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V2a1 1 0 0 0-1.707-.707L13.586 6H12a3 3 0 0 0-3 3z"></path>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-emerald-400">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
              <span className="text-[10px] text-zinc-300 font-mono mt-1 font-bold">{muted ? 'Mute' : 'Audio'}</span>
            </div>

            {/* SOURCE PLAYBACK LINK */}
            <div className="flex flex-col items-center">
              <a 
                href={reel.videoUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center bg-black/40 border border-white/10 backdrop-blur-md hover:text-white text-zinc-400 transition-all active:scale-90"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
              <span className="text-[10px] text-zinc-300 font-mono mt-1 font-bold">Source</span>
            </div>

          </div>

          {/* PREV/NEXT NAVIGATION FLOATING OVERLAYS FOR DESKTOP AID */}
          <div className="absolute left-3.5 bottom-24 z-20 hidden sm:flex flex-col space-y-1.5 shrink-0 pointer-events-auto">
            <button
              disabled={isFirst}
              onClick={onPrev}
              type="button"
              className="p-1.5 bg-black/60 border border-white/10 rounded-lg text-white hover:bg-zinc-900 disabled:opacity-20 transition"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={isLast}
              onClick={onNext}
              type="button"
              className="p-1.5 bg-black/60 border border-white/10 rounded-lg text-white hover:bg-zinc-900 disabled:opacity-20 transition"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ReelsFeed({ initialImages, onSearch, onLoadInstagram }: ReelsFeedProps) {
  const [images, setImages] = useState<SearchResultImage[]>(initialImages);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('cat');
  const [searchSource, setSearchSource] = useState<SearchSource>('all');
  const [feedMode, setFeedMode] = useState<FeedMode>('fit');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSearching, startTransition] = useTransition();
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [autoplayDelay, setAutoplayDelay] = useState(8); // seconds per slide
  const [showDetailsModal, setShowDetailsModal] = useState<SearchResultImage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpicyActive, setIsSpicyActive] = useState(false);
  const [isProxyActive, setIsProxyActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'instagram'>('search');
  const [instaInput, setInstaInput] = useState('');
  const [activeInstaHandle, setActiveInstaHandle] = useState('saraalikhan95');
  const [instaActiveIndex, setInstaActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const instaContainerRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor scroll index for search feed
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (!isNaN(index) && index !== activeIndex && index >= 0 && index < images.length) {
      setActiveIndex(index);
    }
  };

  // Monitor scroll index for Instagram Reels Player page
  const handleInstaScroll = () => {
    if (!instaContainerRef.current) return;
    const { scrollTop, clientHeight } = instaContainerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (!isNaN(index) && index !== instaActiveIndex && index >= 0 && index < 6) {
      setInstaActiveIndex(index);
    }
  };

  // Scroll to vertical Insta card helper
  const scrollInstaTo = (index: number) => {
    if (!instaContainerRef.current || index < 0 || index >= 6) return;
    instaContainerRef.current.scrollTo({
      top: index * instaContainerRef.current.clientHeight,
      behavior: 'smooth',
    });
    setInstaActiveIndex(index);
  };

  // Trigger search with query
  const triggerSearch = async (query: string, source: SearchSource, proxyParam: boolean = isProxyActive) => {
    if (!query.trim()) return;
    setErrorMessage(null);
    setActiveIndex(0);

    // Scroll to top of feeds
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }

    try {
      if (isSpicyActive) {
        // Build a beautiful content mix of the searched term and 2 random spicy recommendations!
        const shuffled = [...SPICY_RECOMMENDATIONS].filter(r => r.query.toLowerCase() !== query.toLowerCase()).sort(() => 0.5 - Math.random());
        const querySet = [query, shuffled[0].query, shuffled[1].query];
        
        console.log('[Spicy Mixing Active] Query set:', querySet);
        const fetchPromises = querySet.map(q => onSearch(q, source, proxyParam).catch(() => []));
        const resultsArray = await Promise.all(fetchPromises);
        
        let combinedResults: SearchResultImage[] = [];
        resultsArray.forEach(group => {
          if (group && group.length > 0) {
            combinedResults.push(...group);
          }
        });
        
        combinedResults = combinedResults.sort(() => 0.5 - Math.random());
        
        if (combinedResults.length > 0) {
          setImages(combinedResults);
          setActiveQuery(`Spicy Mix: ${query} & others`);
        } else {
          const results = await onSearch(query, source, proxyParam);
          setImages(results);
          setActiveQuery(query);
        }
      } else {
        const results = await onSearch(query, source, proxyParam);
        if (results && results.length > 0) {
          setImages(results);
          setActiveQuery(query);
        } else {
          setErrorMessage(`No new results found for "${query}". Try searching something else!`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Search failed. Please try again.');
    }
  };

  // Trigger loading Instagram feed of a public handle directly on the screen
  const triggerInstagramLoad = (url: string) => {
    if (!url.trim()) return;
    setErrorMessage(null);
    
    let username = url.trim();
    // Parse URL is link or handle
    username = username.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
    username = username.split('/')[0].split('?')[0].replace(/^@/, '');
    
    if (!username) {
      setErrorMessage('Please enter a valid Instagram profile handle or link.');
      return;
    }
    
    console.log('[Player Switch] Activating Instagram interactive player for:', username);
    setActiveInstaHandle(username);
    setActiveTab('instagram');
  };

  const handleSpicyModeToggle = () => {
    const nextSpicy = !isSpicyActive;
    setIsSpicyActive(nextSpicy);

    if (nextSpicy) {
      // Pick 3 random spicy recommendations
      const shuffled = [...SPICY_RECOMMENDATIONS].sort(() => 0.5 - Math.random());
      const selectedRecs = shuffled.slice(0, 3);
      
      setErrorMessage(null);
      setActiveIndex(0);
      
      startTransition(async () => {
        try {
          console.log('[Spicy Mode] Activating automatic random recommendation mixing:', selectedRecs.map(r => r.label));
          
          const fetchPromises = selectedRecs.map(rec => onSearch(rec.query, 'google', isProxyActive).catch(() => []));
          const resultsArray = await Promise.all(fetchPromises);
          
          let combinedResults: SearchResultImage[] = [];
          resultsArray.forEach(group => {
            if (group && group.length > 0) {
              combinedResults.push(...group);
            }
          });
          
          combinedResults = combinedResults.sort(() => 0.5 - Math.random());
          
          if (combinedResults.length > 0) {
            setImages(combinedResults);
            setActiveQuery(`Mixed Spicy Feed: ${selectedRecs.map(r => r.label.split(' ')[0]).join(', ')}`);
          } else {
            const defaultSpice = selectedRecs[0].query;
            const singleRes = await onSearch(defaultSpice, 'google', isProxyActive);
            setImages(singleRes);
            setActiveQuery(defaultSpice);
          }
        } catch (err: any) {
          console.error('[Spicy Mode Mix Error]', err);
          const defaultSpice = selectedRecs[0].query;
          const singleRes = await onSearch(defaultSpice, 'google').catch(() => []);
          setImages(singleRes);
          setActiveQuery(defaultSpice);
        }
      });
    } else {
      // Load standard default query 'cat'
      startTransition(async () => {
        await triggerSearch('cat', 'all', isProxyActive);
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    startTransition(async () => {
      await triggerSearch(searchQuery, searchSource);
    });
  };

  const handleCategoryClick = (category: SearchCategory) => {
    setSearchQuery(category.query);
    setActiveQuery(category.query);
    startTransition(async () => {
      await triggerSearch(category.query, searchSource);
    });
  };

  // Scroll to a specific index
  const scrollTo = (index: number) => {
    if (!containerRef.current || index < 0 || index >= images.length) return;
    containerRef.current.scrollTo({
      top: index * containerRef.current.clientHeight,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  // Autoplay Logic
  useEffect(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }

    if (isAutoplay && images.length > 0) {
      autoplayTimerRef.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        scrollTo(nextIndex);
      }, autoplayDelay * 1000);
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [isAutoplay, activeIndex, images.length, autoplayDelay]);

  // Turn off slides if user interacts / scrolls manually
  const toggleAutoplay = () => {
    setIsAutoplay(!isAutoplay);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // ignore in form fields
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollTo(Math.min(activeIndex + 1, images.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollTo(Math.max(activeIndex - 1, 0));
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleAutoplay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setFeedMode(feedMode === 'fit' ? 'fill' : 'fit');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length, feedMode]);

  return (
    <div id="reels-root" className="relative h-screen w-full bg-[#050505] overflow-hidden text-zinc-100 font-sans flex flex-col md:flex-row">
      
      {/* LEFT COMPASS BRANDING RAIL (DESKTOP) */}
      <div id="desktop-rail" className="hidden md:flex flex-col w-72 bg-[#0a0a0a] border-r border-zinc-800 p-6 shrink-0 justify-between">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="bg-zinc-900 border border-zinc-700/60 rounded-full p-2.5 w-11 h-11 flex items-center justify-center shadow-xl">
              <Compass className="w-5.5 h-5.5 text-white animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl font-light tracking-tight text-zinc-100 m-0">Pure Vision</h1>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Image Scroll Feed</p>
            </div>
          </div>

          {/* Description Paragraph */}
          <div className="text-xs text-zinc-400 leading-relaxed font-light">
            An immersive, privacy-focused image exploration tool. No traces left behind, just the visual flow.
          </div>

          {/* Spicy Trigger Button with beautiful red neon glowing effect */}
          <div className="pt-1">
            <button
              onClick={handleSpicyModeToggle}
              className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 border
                ${isSpicyActive 
                  ? 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.85)] animate-pulse' 
                  : 'bg-zinc-950 hover:bg-red-950/20 border-red-900/60 text-red-500 hover:text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_25px_rgba(239,68,68,0.65)] hover:border-red-500'
                }`}
            >
              <Sparkles className="w-4.5 h-4.5 text-current animate-pulse shrink-0" />
              <span>Spicy Mode {!isSpicyActive ? 'OFF' : 'ON'}</span>
            </button>
          </div>

          {/* Spicy recommendations list specifically shown design model when Spicy Mode is ON */}
          {isSpicyActive && (
            <div className="space-y-2 pt-2 border border-red-950/30 bg-red-950/5 p-3 rounded-xl">
              <span className="text-[9px] font-black tracking-wider text-red-500 uppercase font-mono block">HOT RECOMMENDATIONS:</span>
              <div className="grid grid-cols-1 gap-1.5 max-h-[22vh] overflow-y-auto pr-1">
                {SPICY_RECOMMENDATIONS.map((rec, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSearchQuery(rec.query);
                      startTransition(async () => {
                        await triggerSearch(rec.query, 'google');
                      });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono transition-all border ${
                      activeQuery === rec.query
                        ? 'bg-red-950 text-red-200 border-red-800'
                        : 'bg-transparent text-zinc-400 border-transparent hover:bg-red-950/20 hover:text-red-400'
                    }`}
                  >
                    ✨ {rec.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Tool Control Pills: Instagram Public Feed and Miami Proxy Toggle */}
          <div className="space-y-3 pt-1.5 border-t border-zinc-900">
            <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase font-mono block">NAVIGATION</span>
            
            {/* Custom Tab Toggles in the sidebar */}
            <div className="flex bg-zinc-950 border border-zinc-900 rounded-xl p-1 mb-2">
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-1.5 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all font-mono ${
                  activeTab === 'search'
                    ? 'bg-zinc-800 text-white shadow-md'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                🔍 Search
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('instagram')}
                className={`flex-1 py-1.5 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all font-mono flex items-center justify-center gap-1 ${
                  activeTab === 'instagram'
                    ? 'bg-gradient-to-r from-pink-600 via-purple-650 to-indigo-600 text-white font-heavy shadow-md'
                    : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <Instagram className="w-3 h-3 text-white" />
                <span>Insta</span>
              </button>
            </div>

            <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase font-mono block">SETTINGS</span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextProxy = !isProxyActive;
                  setIsProxyActive(nextProxy);
                  if (activeQuery) {
                    startTransition(async () => {
                      await triggerSearch(activeQuery, searchSource, nextProxy);
                    });
                  }
                }}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-all duration-300 border ${
                  isProxyActive
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 shrink-0" />
                <span>Miami Proxy: {isProxyActive ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Core Values Tagged Lines */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center space-x-3 text-zinc-400 hover:text-zinc-200 transition-all">
              <span className="w-6 h-[1px] bg-zinc-800"></span>
              <span className="text-[10px] tracking-widest uppercase font-mono">Zero Tracking</span>
            </div>
            <div className="flex items-center space-x-3 text-zinc-400 hover:text-zinc-200 transition-all">
              <span className="w-6 h-[1px] bg-zinc-800"></span>
              <span className="text-[10px] tracking-widest uppercase font-mono">No Social Metrics</span>
            </div>
            <div className="flex items-center space-x-3 text-zinc-400 hover:text-zinc-200 transition-all">
              <span className="w-6 h-[1px] bg-zinc-800"></span>
              <span className="text-[10px] tracking-widest uppercase font-mono">Raw Index Search</span>
            </div>
          </div>

          {/* Quick Stats Banner (Elegant Dark Minimalist Theme) */}
          <div className="bg-[#111] rounded-xl p-4 border border-zinc-900 text-xs text-zinc-400 space-y-2.5">
            <div className="flex justify-between font-mono">
              <span className="text-zinc-500">Active Term:</span>
              <span className="text-zinc-200 max-w-28 truncate font-medium">#{activeQuery}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-zinc-500">Photos Loaded:</span>
              <span className="text-zinc-200">{images.length}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-zinc-500">Source Provider:</span>
              <span className="text-zinc-200 capitalize">{searchSource === 'all' ? 'Combined' : searchSource}</span>
            </div>
          </div>

          {/* Source Selection Panel */}
          <div className="space-y-3">
            <label className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase flex items-center gap-2 font-mono">
              <TrendingUp className="w-3 h-3 text-zinc-400" /> API ENGINES
            </label>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <button
                id="source-all"
                onClick={() => setSearchSource('all')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all font-mono text-xs border ${
                  searchSource === 'all' 
                    ? 'bg-zinc-900 text-white border-zinc-750 shadow-lg' 
                    : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                }`}
              >
                <span>🌐 Combined</span>
                <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-bold">ALL</span>
              </button>
              <button
                id="source-google"
                onClick={() => setSearchSource('google')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all font-mono text-xs border ${
                  searchSource === 'google' 
                    ? 'bg-zinc-900 text-white border-zinc-750 shadow-lg' 
                    : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                }`}
              >
                <span>🔍 Google Scrape</span>
                <span className="text-[9px] bg-zinc-800 text-zinc-405 px-1.5 py-0.5 rounded">WEB</span>
              </button>
              <button
                id="source-unsplash"
                onClick={() => setSearchSource('unsplash')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all font-mono text-xs border ${
                  searchSource === 'unsplash' 
                    ? 'bg-zinc-900 text-white border-zinc-750 shadow-lg' 
                    : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                }`}
              >
                <span>🎨 Unsplash HD</span>
                <span className="text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">PHOTO</span>
              </button>
            </div>
          </div>

          {/* Quick Categories list */}
          <div className="space-y-3">
            <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase font-mono">TRENDING FEEDS</span>
            <div className="space-y-1.5 max-h-[25vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full flex items-center space-x-2 text-left p-2 rounded-xl transition-all text-xs border ${
                    activeQuery === cat.query 
                      ? 'bg-zinc-900 text-white border-zinc-800 font-semibold' 
                      : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-xs shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Footer (Elegant Dark Labels) */}
        <div className="border-t border-zinc-900 pt-5 text-[10px] text-zinc-500 font-mono space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Safe Search: OFF</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span>Incognito Sandbox Mode</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-zinc-650 rounded-full"></div>
            <span>Raw Image Streaming</span>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT (MIDDLE/RIGHT) */}
      <div className="flex-1 flex flex-col relative h-full bg-[#050505]">

        {activeTab === 'instagram' ? (
          <div className="flex-1 flex flex-col relative h-full bg-black select-none">
            
            {/* FLOATING HEADER AREA */}
            <header className="absolute top-0 inset-x-0 z-40 p-4 bg-gradient-to-b from-black/95 via-black/40 to-transparent flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
              <div className="flex items-center space-x-2 pointer-events-auto shrink-0 w-full md:w-auto justify-between md:justify-start">
                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-lg"
                >
                  <span>← Back</span>
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/35">
                  <Instagram className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold tracking-widest text-pink-300 uppercase">Insta public reels player</span>
                </div>
              </div>

              {/* INPUT BOX */}
              <div className="pointer-events-auto w-full md:max-w-xs">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (instaInput.trim()) {
                      triggerInstagramLoad(instaInput);
                      setInstaInput('');
                    }
                  }}
                  className="flex gap-1.5 relative shadow-2xl"
                >
                  <input
                    type="text"
                    value={instaInput}
                    onChange={(e) => setInstaInput(e.target.value)}
                    placeholder="Type handle (e.g. saraalikhan95)..."
                    className="w-full bg-[#0a0a0a]/90 backdrop-blur-md text-xs text-zinc-100 border border-zinc-800 focus:border-pink-500 rounded-full py-2.5 pl-4 pr-10 focus:outline-none transition-all font-mono animate-pulse"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-pink-500 to-indigo-500 hover:brightness-110 text-white rounded-full transition active:scale-90 flex items-center justify-center shrink-0"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </header>

            {/* MAIN VIDEO SNAP SCROLLER */}
            <div
              id="insta-reels-scroller"
              ref={instaContainerRef}
              onScroll={handleInstaScroll}
              className="flex-1 w-full h-full snap-y snap-mandatory overflow-y-scroll scroll-smooth scrollbar-none bg-black"
              style={{ minHeight: '100vh', scrollSnapType: 'y mandatory' }}
            >
              {getSimulatedInstaReels(activeInstaHandle).map((reel, index) => {
                const isActive = index === instaActiveIndex;
                return (
                  <InstagramReelCard
                    key={reel.id}
                    reel={reel}
                    username={activeInstaHandle}
                    isActive={isActive}
                    feedMode={feedMode}
                    onPrev={() => scrollInstaTo(index - 1)}
                    onNext={() => scrollInstaTo(index + 1)}
                    isFirst={index === 0}
                    isLast={index === 5}
                  />
                );
              })}
            </div>

          </div>
        ) : (
          <>
            {/* SEARCH HEADER BAR (FLOATING GLASSMORPHIC ON MOBILE/TOP) */}
            <header className="absolute top-0 inset-x-0 z-40 p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
              <div className="max-w-xl mx-auto flex flex-col gap-2 pointer-events-auto">
                
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                      id="header-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type anything (e.g., cat, cyberpunk, nebula)..."
                      className="w-full bg-[#0a0a0a]/90 backdrop-blur-md text-sm border border-zinc-800 rounded-full pl-11 pr-11 py-3.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all shadow-2xl"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-zinc-100 hover:bg-white text-zinc-950 rounded-full p-3 font-semibold transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0 flex items-center justify-center w-12.5 h-12.5"
                  >
                    {isSearching ? (
                      <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </button>
                </form>

                {/* Quick Actions Panel underneath search input */}
                <div className="flex items-center gap-2 mt-1 justify-between text-[10px] font-mono">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('instagram')}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-heavy flex items-center gap-1 shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200"
                    >
                      <Instagram className="w-3 h-3 shrink-0 text-white animate-pulse" />
                      <span>Insta Player</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const nextProxy = !isProxyActive;
                        setIsProxyActive(nextProxy);
                        if (activeQuery) {
                          startTransition(async () => {
                            await triggerSearch(activeQuery, searchSource, nextProxy);
                          });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full border flex items-center gap-1 transition-all duration-200 shadow-lg active:scale-95 ${
                        isProxyActive
                          ? 'bg-emerald-600 border-emerald-500 text-white animate-pulse font-bold'
                          : 'bg-black/80 backdrop-blur-md border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Wifi className="w-3 h-3 shrink-0 text-current" />
                      <span>Miami Proxy: {isProxyActive ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>

                  {isProxyActive && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[9px] uppercase tracking-wider font-bold animate-pulse">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      <span className="hidden sm:inline">Miami Sandbox</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-1 px-4 text-[10px] uppercase tracking-widest text-zinc-500 font-semibold font-mono">
                  <div className="flex items-center space-x-2">
                    <span>SafeSearch Off</span>
                    <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                    <span>Incognito Mode</span>
                  </div>
                  
                  {/* Desktop view safe indicator, mobile view Spicy quick pill */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={handleSpicyModeToggle}
                      className={`md:hidden px-2.5 py-1 rounded-full text-[9px] uppercase tracking-widest font-black transition-all border
                        ${isSpicyActive
                          ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.7)]'
                          : 'bg-[#111] border-red-900/40 text-red-500 hover:text-red-400'
                        }`}
                    >
                      🌶️ Spicy Mode: {isSpicyActive ? 'ON' : 'OFF'}
                    </button>
                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-zinc-655 hidden md:block">Ready</span>
                  </div>
                </div>

                {/* MOBILE ONLY SPICY TABS ROW IF ACTIVE */}
                {isSpicyActive && (
                  <div className="flex md:hidden items-center gap-1.5 overflow-x-auto py-1 scrollbar-none scroll-smooth">
                    {SPICY_RECOMMENDATIONS.map((rec, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(rec.query);
                          startTransition(async () => {
                            await triggerSearch(rec.query, 'google');
                          });
                        }}
                        className={`shrink-0 text-[10px] uppercase tracking-wider font-semibold py-1.5 px-3.5 rounded-full border transition-all ${
                          activeQuery === rec.query
                            ? 'bg-red-950 border-red-800 text-red-200'
                            : 'bg-black/80 border-zinc-850 text-zinc-400'
                        }`}
                      >
                        ✨ {rec.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* MOBILE ONLY CATEGORIES / SOURCE ROW */}
                <div className="flex md:hidden items-center justify-between gap-2 overflow-x-auto py-1 scrollbar-none scroll-smooth">
                  <div className="flex space-x-1.5 shrink-0 pr-1">
                    <select
                      value={searchSource}
                      onChange={(e) => setSearchSource(e.target.value as SearchSource)}
                      className="bg-[#0a0a0a]/90 backdrop-blur-md text-[11px] text-zinc-200 border border-zinc-800 rounded-full px-3 py-1.5 font-mono focus:outline-none"
                    >
                      <option value="all">🌐 Combined</option>
                      <option value="google">🔍 Google</option>
                      <option value="unsplash">🎨 Unsplash</option>
                    </select>
                  </div>

                  <div className="flex space-x-1.5 overflow-x-auto shrink-0 scrollbar-none">
                    {CATEGORIES.slice(0, 5).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat)}
                        className={`shrink-0 text-[11px] px-3.5 py-1.5 rounded-full border transition-all ${
                          activeQuery === cat.query
                            ? 'bg-zinc-100 border-zinc-100 text-zinc-900 font-semibold'
                            : 'bg-[#0a0a0a]/80 border-zinc-800 text-zinc-300'
                        }`}
                      >
                        <span>{cat.icon} {cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ERROR BANNER */}
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-zinc-900 border border-zinc-800 backdrop-blur-md text-zinc-300 text-xs px-4 py-2.5 rounded-xl flex justify-between items-center"
                  >
                    <span>⚠️ {errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)} className="text-zinc-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

              </div>
            </header>

            {/* VERTICAL REELS CONTAINER */}
            <div 
              id="reels-scroller"
              ref={containerRef}
              onScroll={handleScroll}
              className="flex-1 w-full h-full snap-y snap-mandatory overflow-y-scroll scroll-smooth scrollbar-none bg-black"
            >
              {images.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-950">
                  <ImageIcon className="w-16 h-16 text-zinc-700 animate-pulse mb-4" />
                  <p className="text-zinc-500 text-sm font-mono">No images matching your search query.</p>
                  <button 
                    onClick={() => triggerSearch('cute cat', 'all')}
                    className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-white transition"
                  >
                    Reset Search
                  </button>
                </div>
              ) : (
                images.map((img, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div 
                      key={img.id}
                      className="snap-start w-full h-full flex items-center justify-center relative select-none bg-black overflow-hidden"
                      style={{ minHeight: '100vh' }}
                    >
                      {/* BASE BACKGROUND BLUR FOR PREMIUM ASPECT CARDS */}
                      <div className="absolute inset-0 bg-zinc-950/95 z-0 flex items-center justify-center">
                        <img 
                          src={img.thumbnail} 
                          alt="" 
                          className="w-full h-full object-cover blur-3xl opacity-20 scale-110 pointer-events-none" 
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* MAIN COATED DISPLAY IMAGE OR IMMERSIVE VERTICAL VIDEO REEL */}
                      <div className="absolute inset-0 z-10 flex items-center justify-center p-0 md:p-3">
                        {img.isVideo ? (
                          <VideoPlayer 
                            src={img.videoUrl || img.url}
                            isActive={isActive}
                            feedMode={feedMode}
                          />
                        ) : (
                          <img
                            src={img.url}
                            alt={img.title}
                            className={`transition-all duration-500 ease-out select-text pointer-events-auto shadow-2xl ${
                              feedMode === 'fill' 
                                ? 'w-full h-full object-cover rounded-none' 
                                : 'max-w-full max-h-full object-contain rounded-none md:rounded-2xl border border-zinc-900/40'
                            }`}
                            loading={Math.abs(index - activeIndex) <= 1 ? 'eager' : 'lazy'}
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>

                      {/* BOTTOM REEL SHADOW OVERLAY FOR UI TEXT legibility */}
                      <div className="absolute bottom-0 inset-x-0 h-1/4 bg-gradient-to-t from-black/80 to-transparent z-20 pointer-events-none" />

                      {/* BOTTOM INFO BAR WITH DESCRIPTIONS REMOVED PER USER DIRECTIVE FOR ZERO IMAGE DESCRIPTION CLUTTER */}

                      {/* FLOATING ACTION SIDEBAR OVERLAY (RIGHT SIDE) */}
                      <div className="absolute right-3 md:right-5 bottom-24 md:bottom-28 z-30 flex flex-col items-center space-y-4 md:space-y-6 pointer-events-auto">
                        
                        {/* ASPECT RATIO CONFIG BUTTON */}
                        <div className="flex flex-col items-center group">
                          <button
                            onClick={() => setFeedMode(feedMode === 'fit' ? 'fill' : 'fit')}
                            className="w-13 h-13 md:w-14 md:h-14 rounded-full bg-[#0a0a0a]/90 border border-zinc-800 backdrop-blur-md text-zinc-350 flex items-center justify-center hover:bg-zinc-900 hover:text-white hover:scale-105 active:scale-95 shadow-2xl select-none transition-all"
                            title={feedMode === 'fit' ? 'Fill Screen (Cover)' : 'Fit Screen (Contain)'}
                          >
                            {feedMode === 'fit' ? (
                              <Maximize2 className="w-5 h-5" />
                            ) : (
                              <Minimize2 className="w-5 h-5" />
                            )}
                          </button>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1.5 w-full text-center">
                            {feedMode === 'fit' ? 'Fit' : 'Fill'}
                          </span>
                        </div>

                        {/* AUTOPLAY TOGGLE BUTTON */}
                        <div className="flex flex-col items-center group">
                          <button
                            onClick={toggleAutoplay}
                            className={`w-13 h-13 md:w-14 md:h-14 rounded-full border backdrop-blur-md flex items-center justify-center hover:scale-105 active:scale-95 shadow-2xl select-none transition-all ${
                              isAutoplay 
                                ? 'bg-zinc-100 border-zinc-100 text-zinc-950 shadow-inner' 
                                : 'bg-[#0a0a0a]/90 border-zinc-800 text-zinc-350 hover:bg-zinc-900 hover:text-white'
                            }`}
                            title={isAutoplay ? 'Pause Slideshow' : 'Start Slideshow'}
                          >
                            {isAutoplay ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1.5 w-full text-center">
                            {isAutoplay ? 'Auto' : 'Play'}
                          </span>
                        </div>

                        {/* DIRECT DOWNLOAD/OPEN */}
                        <div className="flex flex-col items-center">
                          <a
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-13 h-13 md:w-14 md:h-14 rounded-full bg-[#0a0a0a]/90 border border-zinc-850 backdrop-blur-md text-zinc-350 flex items-center justify-center hover:bg-zinc-900 hover:text-white hover:scale-105 active:scale-95 shadow-2xl select-none transition-all"
                            title="View Original Size Image"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1.5 w-full text-center">
                            HD
                          </span>
                        </div>

                        {/* FEED POSITION COUNTER */}
                        <div className="bg-[#0a0a0a]/95 border border-zinc-805 rounded-xl px-2.5 py-2 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
                          <span className="text-[13px] font-light tracking-tight text-white font-mono">{index + 1}</span>
                          <div className="w-4 h-[1px] bg-zinc-800 my-1" />
                          <span className="text-[9px] font-semibold text-zinc-655 font-mono">{images.length}</span>
                        </div>

                      </div>

                      {/* SCROLL BUTTONS FOR DESKTOP AID */}
                      <div className="absolute right-5 bottom-8 z-30 hidden md:flex items-center space-x-1.5">
                        <button
                          disabled={index === 0}
                          onClick={() => scrollTo(index - 1)}
                          className="p-1.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={index === images.length - 1}
                          onClick={() => scrollTo(index + 1)}
                          className="p-1.5 bg-[#111]/60 hover:bg-zinc-800 border border-zinc-700/50 rounded-lg text-zinc-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* TOP LEVEL AUTOPLAY PROGRESS INDICATOR ELEMENT */}
            {isAutoplay && images.length > 0 && (
              <div className="absolute bottom-0 inset-x-0 h-1.5 bg-zinc-900 z-40 pointer-events-none">
                <motion.div 
                  key={activeIndex}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: autoplayDelay, ease: 'linear' }}
                  className="h-full bg-zinc-105 rounded-r shadow-lg cursor-pointer"
                />
              </div>
            )}
          </>
        )}

      </div>

      {/* DETAIL MODAL PANEL */}
      <AnimatePresence>
        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl space-y-4"
            >
              <button 
                onClick={() => setShowDetailsModal(null)} 
                className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-850 p-1.5 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3 pb-2 border-b border-zinc-800">
                <ImageIcon className="w-5 h-5 text-zinc-300" />
                <h3 className="text-base font-bold text-white m-0 font-sans">Image Properties</h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-zinc-300">
                <div className="p-2.5 bg-zinc-950 rounded-lg space-y-1">
                  <div className="text-zinc-500 font-semibold label">URL Reference:</div>
                  <div className="break-all select-text font-normal text-zinc-200 text-[11px] leading-relaxed max-h-24 overflow-y-auto">
                    {showDetailsModal.url}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-1 text-zinc-300">
                  <div className="p-2.5 bg-zinc-950 rounded-lg">
                    <span className="text-zinc-500 font-semibold text-[10px] uppercase">Engine Brand</span>
                    <strong className="block text-white text-xs mt-0.5">{showDetailsModal.sourceName}</strong>
                  </div>
                  {showDetailsModal.author && (
                    <div className="p-2.5 bg-zinc-950 rounded-lg">
                      <span className="text-zinc-500 font-semibold text-[10px] uppercase">Attribution</span>
                      <strong className="block text-white text-xs mt-0.5 truncate">{showDetailsModal.author}</strong>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-zinc-950 rounded-lg flex items-center justify-between text-zinc-300">
                  <span className="text-zinc-500 font-semibold">External Link:</span>
                  <a 
                    href={showDetailsModal.sourceUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-zinc-300 hover:text-white flex items-center hover:underline"
                  >
                    Visit original site <ExternalLink className="w-3 h-3 ml-1 text-zinc-500" />
                  </a>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowDetailsModal(null)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-250 text-xs font-semibold px-4.5 py-2.5 rounded-full"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
