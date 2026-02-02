import React, { useState, useEffect } from 'react';
import '../styles/slideshow.css';
// Local images from src/assets (bundled by Vite)
import imgHero from '../assets/ChatGPT Image Nov 8, 2025, 11_46_27 AM.jpg';
import imgGround from '../assets/ground.jpg';
import imgGround2 from '../assets/groundlogistic1.jpg';
import imgFullhub from '../assets/fullhub-logistics-ground-transport-scaled-800x400.jpeg';

const ImageSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Logistics-related images (local assets)
  const slides = [
    { url: imgHero, alt: 'Logistics Hero' }, // Requested hero image
    { url: imgGround, alt: 'Ground Transport' },
    { url: imgGround2, alt: 'Logistics Operations' },
    { url: imgFullhub, alt: 'Transport Fleet' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="slideshow-container">
      <div className="slideshow-wrapper">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={slide.url} alt={slide.alt} />
          </div>
        ))}

        {/* Previous Button */}
        <button className="slide-control prev" onClick={prevSlide} aria-label="Previous slide">
          <i className="fas fa-chevron-left"></i>
        </button>

        {/* Next Button */}
        <button className="slide-control next" onClick={nextSlide} aria-label="Next slide">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* Indicators */}
      <div className="slide-indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlideshow;
