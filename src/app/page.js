import Image from "next/image";
import Header from "./components/header/header";
import Hero from "./components/hero/hero";
import SubHeader from "./components/sub-header/subHeader";
import Footer from "./components/footer/footer";
export default function Home() {
  return (
    <div>
      <Header />
      <SubHeader />
      <Hero />
      <Footer />
    </div>
  );
}
