import { BenefitsSection } from "@/components/landing-page/benefits-section";
import { HeroSection } from "@/components/landing-page/hero-section";
import { TeamSection } from "@/components/landing-page/team-section";

export default async function Home() {
  return (
    <div className="w-full py-10 lg:py-20">
      <div className="container mx-auto space-y-12">
        <HeroSection />
        <BenefitsSection />
        <TeamSection />
      </div>
    </div>
  );
}
