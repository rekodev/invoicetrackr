import type { NextPage } from "next";

import Faq from "../components/home/faq";
import Features from "../components/home/features";
import GetStarted from "../components/home/get-started";
import Hero from "../components/home/hero";
import Plans from "../components/home/plans";

const Home: NextPage = () => {
  const renderDivider = () => (
    <div className="border-t border-default-100 w-full" />
  );

  return (
    <>
      <Hero />
      {renderDivider()}
      <Features />
      {renderDivider()}
      <Plans />
      {renderDivider()}
      <Faq />
      {renderDivider()}
      <GetStarted />
    </>
  );
};

export default Home;
