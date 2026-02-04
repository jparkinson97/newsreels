import { useState, useRef, useEffect, useCallback } from 'react';
import VideoCard from './VideoCard';
import './VideoFeed.css';

// Sample news videos - replace with your own YouTube video IDs
const SAMPLE_VIDEOS = [
  {
    id: 1,
    youtubeId: 'dQw4w9WgXcQ', // Replace with actual news video IDs
    title: 'Breaking News: Tech Industry Updates',
    source: 'Tech News Daily',
    description: 'Latest developments in the technology sector and what it means for you.',
    likes: '12.5K',
    comments: '843',
  },
  {
    id: 2,
    youtubeId: '9bZkp7q19f0',
    title: 'World Events Summary',
    source: 'Global News Network',
    description: 'A quick recap of today\'s most important world events.',
    likes: '8.2K',
    comments: '521',
  },
  {
    id: 3,
    youtubeId: 'kJQP7kiw5Fk',
    title: 'Financial Markets Update',
    source: 'Finance Today',
    description: 'Stock market movements and economic indicators for the day.',
    likes: '5.7K',
    comments: '312',
  },
  {
    id: 4,
    youtubeId: 'fJ9rUzIMcZQ',
    title: 'Science & Discovery',
    source: 'Science Weekly',
    description: 'New scientific breakthroughs and discoveries making headlines.',
    likes: '15.3K',
    comments: '1.2K',
  },
];

export default function VideoFeed({ shaderEnabled }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videos] = useState(SAMPLE_VIDEOS);
  const feedRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer to detect which video is in view
  useEffect(() => {
    const options = {
      root: feedRef.current,
      rootMargin: '0px',
      threshold: 0.6, // Video needs to be 60% visible to be considered "active"
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index, 10);
          setActiveIndex(index);
        }
      });
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe video cards
  const observeCard = useCallback((node) => {
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollToIndex(Math.min(activeIndex + 1, videos.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollToIndex(Math.max(activeIndex - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, videos.length]);

  const scrollToIndex = (index) => {
    const feed = feedRef.current;
    if (feed) {
      const cards = feed.querySelectorAll('.video-card');
      if (cards[index]) {
        cards[index].scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div ref={feedRef} className="video-feed">
      {videos.map((video, index) => (
        <div
          key={video.id}
          ref={observeCard}
          data-index={index}
        >
          <VideoCard
            video={video}
            isActive={index === activeIndex}
            shaderEnabled={shaderEnabled}
          />
        </div>
      ))}

      {/* Navigation dots */}
      <div className="nav-dots">
        {videos.map((_, index) => (
          <button
            key={index}
            className={`nav-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
