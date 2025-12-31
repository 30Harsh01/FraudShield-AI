import { Link } from "react-router-dom";
import LottieCard from "./LottieCard";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black px-6 py-10 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="mb-4 inline-flex flex-col items-center gap-2">
          <div className="
            bg-blue-100 text-blue-600
            dark:bg-white/10 dark:text-blue-400
            px-4 py-1.5 text-sm mt-4 rounded-full
          ">
            Introducing AI Based Fraud Detector
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex justify-center">
        <Link
          to="/detector"
          className="
            transform transition-all duration-300
            hover:scale-105
            hover:shadow-xl
            dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]
          "
        >
          <LottieCard
            title="Fraud Detector"
            subtitle="Design with a Global Perspective, Innovate with Ease."
            animationPath="/kdfs.json"
          />
        </Link>
      </div>

      {/* Footer */}
      <footer className="
        text-center text-sm
        text-gray-500 dark:text-gray-400
        mt-auto pt-10
      ">
        © {new Date().getFullYear()} Harsh Saxena. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
