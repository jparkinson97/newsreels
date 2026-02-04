import { useState, useRef, useEffect } from 'react';
import './VideoCard.css';

export default function VideoCard({ video, isActive, shaderEnabled }) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [iframeDimensions, setIframeDimensions] = useState({ width: '100%', height: '100%' });

  // Calculate optimal 16:9 dimensions to fit container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const targetRatio = 16 / 9;

        let width, height;
        if (containerWidth / containerHeight > targetRatio) {
          // Container is wider than 16:9, constrain by height
          height = containerHeight;
          width = height * targetRatio;
        } else {
          // Container is taller than 16:9, constrain by width
          width = containerWidth;
          height = width / targetRatio;
        }

        setIframeDimensions({ width: `${width}px`, height: `${height}px` });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Build YouTube embed URL with parameters
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?` + new URLSearchParams({
    autoplay: isActive ? 1 : 0,
    mute: 1, // Required for autoplay to work
    controls: 1,
    modestbranding: 1,
    rel: 0,
    playsinline: 1,
    enablejsapi: 1,
  }).toString();

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      ref={iframeRef}
      className={`video-card ${isActive ? 'active' : ''} ${shaderEnabled ? 'shader-enabled' : ''}`}
    >
      <div className="video-container" ref={containerRef}>
        {isLoading && (
          <div className="video-loading">
            <div className="loading-spinner"></div>
            <p>Loading video...</p>
          </div>
        )}
        <iframe
          src={embedUrl}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
          className="youtube-iframe"
          style={{ width: iframeDimensions.width, height: iframeDimensions.height }}
        />
      </div>

      <div className="video-overlay">
        <div className="video-info">
          <h2 className="video-title">{video.title}</h2>
          <p className="video-source">{video.source}</p>
          <p className="video-description">{video.description}</p>
        </div>

        <div className="video-actions">
          <button className="action-btn" onClick={(e) => e.stopPropagation()}>
            <span className="icon">👍</span>
            <span className="count">{video.likes || '0'}</span>
          </button>
          <button className="action-btn" onClick={(e) => e.stopPropagation()}>
            <span className="icon">💬</span>
            <span className="count">{video.comments || '0'}</span>
          </button>
          <button className="action-btn" onClick={(e) => e.stopPropagation()}>
            <span className="icon">↗️</span>
            <span className="count">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
