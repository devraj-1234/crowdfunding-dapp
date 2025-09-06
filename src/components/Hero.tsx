"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";

const inspirationalImages = [
  "/happy-children-learning-in-classroom-with-books-an.jpg",
  "/community-garden-with-people-planting-together-che.jpg",
  "/medical-volunteers-helping-patients-with-warm-smil.jpg",
  "/clean-water-well-in-village-with-celebrating-famil.jpg",
  "/solar-panels-being-installed-by-happy-workers-in-s.jpg",
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % inspirationalImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentImageIndex((prev) => (prev + 1) % inspirationalImages.length);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const prevImage = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + inspirationalImages.length) % inspirationalImages.length
      );
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <section className="mb-16 mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            🌟 Making Dreams Come True Together 🌟
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Where dreams meet reality through the power of community.
            <span className="font-semibold text-blue-600">
              {" "}
              100% transparent
            </span>
            ,
            <span className="font-semibold text-green-600">
              {" "}
              fully accountable
            </span>
            , and built with love. ❤️
          </p>
        </div>

        {/* Carousel */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="relative h-96 md:h-[500px]">
            <Image
              src={inspirationalImages[currentImageIndex] || "/placeholder.svg"}
              alt="Inspiring crowdfunding success story"
              layout="fill"
              objectFit="cover"
              className={`transition-all duration-500 ${
                isAnimating ? "scale-105 opacity-90" : "scale-100 opacity-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Carousel controls */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>

            {/* Carousel indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {inspirationalImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? "bg-white scale-125"
                      : "bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* Overlay text */}
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Every donation creates ripples of hope 🌊
              </h3>
              <p className="text-lg opacity-90">
                Join thousands of changemakers making the world a better place,
                one campaign at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Transparency section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center mb-8">
          <Shield className="mx-auto mb-4 animate-bounce" size={48} />
          <h3 className="text-2xl font-bold mb-4">
            🔒 Complete Transparency Promise
          </h3>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto">
            Every transaction is recorded on the blockchain. Every dollar is
            tracked. Every campaign is verified. We believe in radical
            transparency because your trust is our most valuable asset. View all
            transactions, audit trails, and impact reports in real-time. No
            hidden fees, no surprises - just pure, honest crowdfunding.
          </p>
        </div>
      </div>
    </section>
  );
}
