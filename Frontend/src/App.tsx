import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Kdfs from "./components/fraudDetector";


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detector" element={<Kdfs />} />
    </Routes>
  );
};

export default App;
