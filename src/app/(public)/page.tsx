import { ROUTES } from "@/settings/routes";
import { redirect } from "next/navigation";

export default async function Home() {
  return redirect(ROUTES.PUBLIC.login.getPath());

  /* return (
    <div className="w-full py-10 lg:py-20">
      <div className="container mx-auto space-y-12">
        <HeroSection />
        <BenefitsSection />
        <TeamSection />
        <div className="flex justify-center">
          <FAQSection />
        </div>
      </div>
    </div>
  ); */
}
