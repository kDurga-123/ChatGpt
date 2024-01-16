import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const watchDemo = () => {
    window.open('./Resources/demoa.webm', '_blank');
  };

  return (
    <div>
      <div className="container">
        <div className="main-section">
        </div> 
        <div className="content-wrapper">
          <img src="https://img.freepik.com/free-vector/artificial-intelligence-ai-robot-server-room-digital-technology-banner-computer-equipment_39422-768.jpg?size=626&ext=jpg&ga=GA1.1.460498844.1702486410&semt=sph" alt="imageforlogo" />
        </div>
      </div>
      <div className="left-column">
        <div className="right-column">
          <div className="logos">
              <div></div>
              <div></div>
          </div>
          <div className="logo-area"></div>
          <div className="text-section">
            <h1>Building a personalized AI model with selected personal data.</h1>
            <div>
              AI is changing the world, and we're leading the way. Together, we can build our own AI with personal data.
            </div>
            <div>
              <Link to="/page">
                <button className="first-button">Get started &rarr;</button>
              </Link>
            </div>
          </div>
        </div>
        <div id="form-label">
          <div className="feature-box">
            <div className="feature-icon">
              <button onClick={watchDemo} className="watch_btn">Watch Demo</button>
            </div>
          </div>
          <div className="feature-description">
            <img src="./Resources/logo3.png" className="service-container" alt="pageImage" />
            <input className="meaningful-input" placeholder="AI is generating..." />
            <img src="./Resources/prompt.png" id="prompt-image" alt="PromptImage" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
