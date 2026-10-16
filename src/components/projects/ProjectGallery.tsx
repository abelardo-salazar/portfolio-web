"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import FsLightbox from "fslightbox-react";
import { Expand } from "lucide-react";

// Buttons default to inline-block; the image and overlay are absolutely
// positioned, so only display and padding need resetting.
const buttonReset = "block p-0";
// Same focus ring as the DS controls (Button, Chip, ToggleGroup).
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

export const ProjectGallery = ({ images, title }: ProjectGalleryProps) => {
  const t = useTranslations("Projects.gallery");
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
      <button
        type="button"
        aria-label={t("openMain", { title })}
        className={`relative group cursor-zoom-in overflow-hidden rounded-2xl border border-base-content/10 aspect-video w-full ${buttonReset} ${focusRing}`}
        onClick={() => openLightboxOnIndex(0)}
      >
        <Image
          src={mainImage}
          alt={t("mainAlt", { title })}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, 80vw"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center">
          <Expand className="text-white w-8 h-8" />
        </div>
      </button>

      {gridImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gridImages.map((img, index) => (
            <button
              type="button"
              key={index}
              aria-label={t("openImage", { title, index: index + 1 })}
              className={`relative group cursor-pointer overflow-hidden rounded-xl border border-base-content/10 aspect-[4/3] w-full ${buttonReset} ${focusRing}`}
              onClick={() => openLightboxOnIndex(index + 1)}
            >
              <Image
                src={img}
                alt={t("imageAlt", { title, index: index + 1 })}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </button>
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
