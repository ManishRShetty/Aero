import React from "react";

interface BentoGridProps {
  children: React.ReactNode;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children }) => {
  return (
    <div className="w-full max-w-[1700px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
      {children}
    </div>
  );
};
