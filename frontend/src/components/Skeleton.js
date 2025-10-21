import React from 'react';

const Skeleton = ({ height = 16, width = '100%', style }) => {
  return (
    <div
      className="skeleton"
      style={{ height, width, ...style }}
    />
  );
};

export default Skeleton;


