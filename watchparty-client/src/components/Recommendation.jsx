import React, { useState, useEffect } from "react";
import "../assets/Recommendation.css"; // Add CSS for styling

const Recommendation = () => {
    const [loading, setLoading] = useState(true);
    const [currentMessage, setCurrentMessage] = useState("");
    const messages = [
      "Preparing your data...",
      "Getting the best recommendations for you...",
      "Almost ready...",
    ];
  
    useEffect(() => {
      // Cycle through messages every 3 seconds
      let messageIndex = 0;
      const messageInterval = setInterval(() => {
        setCurrentMessage(messages[messageIndex]);
        messageIndex = (messageIndex + 1) % messages.length;
      }, 3000);
  
      // Hide loader after 20 seconds
      const loaderTimeout = setTimeout(() => {
        setLoading(false);
        clearInterval(messageInterval);
      }, 20000);
  
      // Cleanup on unmount
      return () => {
        clearInterval(messageInterval);
        clearTimeout(loaderTimeout);
      };
    }, []);
  
    return (
      <div>
        {loading ? (
          <div className="loader-container">
              <div className="blinking-container">
                <span className="blinking-text mb-3">{currentMessage}</span>
              </div>
            <div className="loader-background">
              <div className="progress-bar">
                <div className="progress"></div>
              </div>
              <div className="blinking-container">
                <span className="rotating-icon">⚙️</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="recommendation-content">
            {/* Your actual page content */}
            <h1>Welcome to Your Recommendations</h1>
            <p>Here are the best recommendations for you!</p>
          </div>
        )}
      </div>
    );
  };
  
  export default Recommendation;
