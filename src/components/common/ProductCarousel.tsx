import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

interface Product {
  id: string | number;
  name: string;
  brand?: string;
  price: number;
  original_price?: number;
  discount?: number;
  category?: string;
  image_url?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  reviews_count?: number;
  featured?: boolean;
  description?: string;
  in_stock?: boolean;
  stock_count?: number;
  promotion_badge?: string;
  colors?: string[];
  sizes?: string[];
  sku?: string;
}

interface ProductCarouselProps {
  products: Product[];
  title: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  autoSlide?: boolean;
  autoSlideInterval?: number;
  className?: string;
  maxItems?: number;
  continuousMode?: boolean; // New prop for truly continuous sliding
}

export default function ProductCarousel({
  products,
  title,
  subtitle,
  showViewAll = true,
  viewAllLink = '/products',
  autoSlide = false,
  autoSlideInterval = 5000,
  className = '',
  maxItems = 6,
  continuousMode = true
}: ProductCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    large: 4
  };

  const getItemsPerView = useCallback(() => {
    if (windowWidth < 640) return itemsPerView.mobile;
    if (windowWidth < 1024) return itemsPerView.tablet;
    if (windowWidth < 1280) return itemsPerView.desktop;
    return itemsPerView.large;
  }, [windowWidth]);

  const displayedProducts = products.slice(0, maxItems);
  const currentItemsPerView = getItemsPerView();
  
  // Create infinite loop by duplicating products
  const infiniteProducts = [...displayedProducts, ...displayedProducts, ...displayedProducts];
  const totalSlides = Math.ceil(infiniteProducts.length / currentItemsPerView);
  const [currentSlide, setCurrentSlide] = useState(displayedProducts.length);
  
  // For continuous mode, create even more duplicates for seamless scrolling
  const continuousProducts = continuousMode 
    ? [...displayedProducts, ...displayedProducts, ...displayedProducts, ...displayedProducts, ...displayedProducts]
    : infiniteProducts;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = prev + 1;
      // Reset to middle section when reaching the end for seamless loop
      if (next >= totalSlides - displayedProducts.length) {
        // Use setTimeout to reset position after animation completes
        setTimeout(() => {
          setCurrentSlide(displayedProducts.length);
        }, continuousMode ? 1500 : 1200);
        return next;
      }
      return next;
    });
  }, [totalSlides, displayedProducts.length, continuousMode]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = prev - 1;
      // Reset to middle section when reaching the beginning for seamless loop
      if (next < displayedProducts.length) {
        // Use setTimeout to reset position after animation completes
        setTimeout(() => {
          setCurrentSlide(displayedProducts.length * 2);
        }, continuousMode ? 1500 : 1200);
        return next;
      }
      return next;
    });
  }, [displayedProducts.length, continuousMode]);

  // Auto-slide functionality with continuous motion
  useEffect(() => {
    if (autoSlide && !isHovered && displayedProducts.length > currentItemsPerView) {
      intervalRef.current = setInterval(nextSlide, autoSlideInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSlide, isHovered, displayedProducts.length, currentItemsPerView, autoSlideInterval, nextSlide]);

  if (displayedProducts.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>
          {showViewAll && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mt-4 sm:mt-0 group"
            >
              View All Products
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {displayedProducts.length > currentItemsPerView && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-gray-200"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Products Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-hidden relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
              minHeight: '400px',
              willChange: 'transform'
            }}
          >
            <motion.div
              className="flex"
              animate={{
                x: `-${currentSlide * (100 / totalSlides)}%`
              }}
              transition={{
                type: "tween",
                ease: continuousMode ? [0.4, 0.0, 0.2, 1] : [0.25, 0.1, 0.25, 1], // Smoother easing for continuous mode
                duration: continuousMode ? 1.5 : 1.2
              }}
              style={{
                width: `${totalSlides * 100}%`,
                willChange: 'transform'
              }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="w-full flex-shrink-0"
                  style={{ width: `${100 / totalSlides}%` }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
                    {continuousProducts
                      .slice(slideIndex * currentItemsPerView, (slideIndex + 1) * currentItemsPerView)
                      .map((product, index) => (
                        <motion.div
                          key={`${product.id}-${slideIndex}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.6, 
                            delay: index * 0.1,
                            ease: [0.4, 0.0, 0.2, 1]
                          }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator - Simplified for continuous motion */}
          {displayedProducts.length > currentItemsPerView && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(displayedProducts.length / currentItemsPerView) }).map((_, index) => {
                const isActive = (currentSlide - displayedProducts.length) % Math.ceil(displayedProducts.length / currentItemsPerView) === index;
                return (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      isActive
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
