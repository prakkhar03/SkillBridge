import React from "react";

export const FeatureCard = ({ icon, title, description }) => {
  return (
    // Card container
    // - bg-white: Sets a white background.
    // - rounded-2xl: Applies large, soft rounded corners.
    // - shadow-lg: Adds a prominent, soft shadow for a "lifted" effect.
    // - p-8: Adds generous padding (2rem) inside the card.
    // - flex, flex-col: Makes the card a flex container with a vertical direction,
    //   which helps if you want to add a "Learn More" button at the bottom later.
    <div className="rounded-2xl shadow-lg p-8 flex flex-col" style={{ backgroundColor: "#e9e8e8ff" }}>
      {React.cloneElement(icon, { className: "h-16 w-16 mb-6 p-2" })}
      
      <h2 className="text-2xl font-bold mb-3" style={{ color: "#74767dff" }}>
        {title}
      </h2>
      
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};