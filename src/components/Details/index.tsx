
import React from "react";
interface DetailsOptions{
  children: React.ReactNode;
};

export const Details = ({children}: DetailsOptions) => {
  return (
      {children}
  );
};