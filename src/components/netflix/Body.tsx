import React from "react";
import Browse from "./Browse";
import BrowseSeries from "./BrowseSeries";
interface BodyProps {
}

const Body: React.FC<BodyProps> = () => {
  return (
    <div>
      <Browse />     
    </div>
  );
};

export default Body;