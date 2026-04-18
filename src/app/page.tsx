import { HeroSection } from "@/components/home/HeroSection";
import { CarSelectorSection } from "@/components/home/CarSelectorSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { FAQSection } from "@/components/home/FAQSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CarSelectorSection />
      <FeaturesSection />
      <FAQSection />
    </>
  );
}
