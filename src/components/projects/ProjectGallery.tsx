"use client";

import { useState } from "react";
import Image from "next/image";
import FsLightbox from "fslightbox-react";
import { Expand } from "lucide-react";

interface ProjectGalleryProps {
  images: string[];
}

export const ProjectGallery = ({ images }: ProjectGalleryProps) => {
  const [toggler, setToggler] = useState(false);
  const [productIndex, setProductIndex] = useState(0);

  const openLightboxOnIndex = (index: number) => {
    setProductIndex(index);
    setToggler(!toggler);
  };

  if (!images || images.length === 0) return null;

  const mainImage = images[0];
  const gridImages = images.slice(1);

  return (
    <div className="space-y-4">
      <div
        className="relative group cursor-zoom-in overflow-hidden rounded-2xl border border-base-content/10 aspect-video w-full"
        onClick={() => openLightboxOnIndex(0)}
      >
        <Image
          src={mainImage}
          alt="Project main view"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, 80vw"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Expand className="text-white w-8 h-8" />
        </div>
      </div>

      {gridImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gridImages.map((img, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-xl border border-base-content/10 aspect-[4/3] w-full"
              onClick={() => openLightboxOnIndex(index + 1)}
            >
              <Image
                src={img}
                alt={`Project gallery view ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}

      <FsLightbox
        toggler={toggler}
        sources={images}
        sourceIndex={productIndex}
        type="image"
      />
    </div>
  );
};
