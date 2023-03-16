import React from 'react';
import restaurants from '@data/restaurants.json';
import RestaurantCard from './commons/RestaurantCard';

const Candidates = () => {
  return (
    <div>
      {restaurants.map((restaurant, index) => (
        <RestaurantCard key={index} restaurant={restaurant} period={30} />
      ))}
    </div>
  );
};

export default Candidates;
