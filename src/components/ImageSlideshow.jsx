import React, { useState, useEffect } from 'react';
import '../styles/slideshow.css';

const ImageSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Logistics-related images
  const slides = [
    {
      url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      alt: 'Logistics Truck Delivery'
    },
    {
      url: 'https://images.unsplash.com/photo-1585519048919-c3400ca199e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      alt: 'Cargo Shipping'
    },
    {
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      alt: 'Warehouse Operations'
    },
    {
      url: 'https://images.unsplash.com/photo-1578575437980-4a82f8edd492?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      alt: 'Package Delivery'
    },
    {
      url: 'https://images.unsplash.com/photo-1635147063614-43150dbe10da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      alt: 'Logistics Network'
    }
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
