import React from 'react';
import { Restaurant } from 'types';

// type props = {
//   data: Restaurant;
// };

const InfoWindow = ({ data }: { data: Restaurant }) => {
  return (
    <div>
      <div>{data.name}</div>
      <div>{data.tags}</div>
      <div>{data.period}</div>
    </div>
  );
};

export default InfoWindow;
