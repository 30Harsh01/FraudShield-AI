import { useEffect, useState } from "react";
import Lottie from "react-lottie-player";

interface LottieCardProps {
  title: string;
  subtitle: string;
  animationPath: string;
}

const LottieCard = ({ title, animationPath }: LottieCardProps) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(animationPath)
      .then((res) => res.json())
      .then(setAnimationData);
  }, [animationPath]);

  return (
    <div className=" rounded-lg p-6 px-48 flex flex-col items-center h-80 w-full text-center">
      {animationData && (
        <Lottie loop play animationData={animationData} className="h-48 mb-4" />
      )}
      <h2 className=" rounded-lg text-2xl border border-spacing-1 p-2 font-semibold text-black mb-2">{title}</h2>
      {/* <p className="text-sm  text-gray-400">{subtitle}</p> */}
    </div>
  );
};

export default LottieCard;
