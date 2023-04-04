import React from 'react';
import RestaurantCard from '@components/commons/RestaurantCard';
import restaurants from '@data/restaurants.json';

const History = () => {
  return (
    <div>
      {restaurants.slice(0, 4).map((restaurant, index) => (
        <RestaurantCard key={index} restaurant={restaurant} />
      ))}
    </div>
  );
};

export default History;
