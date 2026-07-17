import { HeroSection } from "@/components/home/HeroSection";
import { CarSelectorSection } from "@/components/home/CarSelectorSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { MaterialsSection } from "@/components/home/MaterialsSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
// import { GallerySection } from "@/components/home/GallerySection"; // "Наши работы" — temporarily hidden
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { ComparisonSection } from "@/components/home/ComparisonSection";
import { FAQSection } from "@/components/home/FAQSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CarSelectorSection />
      <ProcessSection />
      <MaterialsSection />
      <FeaturesSection />
      {/* <GallerySection /> — "Наши работы" temporarily hidden per request */}
      <ReviewsSection />
      <ComparisonSection />
      <FAQSection />
    </>
  );
}
