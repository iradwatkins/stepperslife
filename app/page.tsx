import { HeroSection } from "./components/home/HeroSection";
import { MagazineArticlesFeed } from "./components/home/MagazineArticlesFeed";
import { EventsGrid } from "./components/home/EventsGrid";
import { StoresShowcase } from "./components/home/StoresShowcase";
import { RestaurantsShowcase } from "./components/home/RestaurantsShowcase";
import { ClassesSpotlight } from "./components/home/ClassesSpotlight";
import { ServicesDirectory } from "./components/home/ServicesDirectory";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <MagazineArticlesFeed />
      <EventsGrid />
      <StoresShowcase />
      <RestaurantsShowcase />
      <ClassesSpotlight />
      <ServicesDirectory />
    </div>
  );
}
