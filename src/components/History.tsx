import React, { useState, useEffect } from 'react';
import RestaurantCard from '@components/commons/RestaurantCard';
import restaurants from '@data/restaurants.json';
import last_visit_data from '@data/restaurants copy.json';
import { HistoryType, Restaurant, StringKeyObj } from 'types';

type HistoryProps = {
  history: HistoryType;
};

const History = ({ history }: HistoryProps) => {
  // const [data, setData] = useState<Object[]>([]);

  // useEffect(() => {
  //   // const keys: string[] = Object.keys(history);
  //   // console.log(`히스토리   ${JSON.stringify(history)}      ${keys}`);
  //   // setData(
  //   //   keys.map((key) => ({ ...test[key], visit: history[key], name: key })),
  //   // );
  //   // console.log('응애ㅐㅐㅐㅐㅐㅐㅐㅐㅐ', data);
  // }, [history]);

  const addRestaurant = () => {
    console.log(`log from addRestaurant`);
  };

  return (
    <div>
      {restaurants.map((restaurant, index) => {
        // const lastVisit: StringKeyObj = last_visit_data;
        return (
          <RestaurantCard
            key={restaurant.name}
            restaurant={restaurant}
            visit={history[restaurant.name]}
            onBtnClick={addRestaurant}
          />
        );
      })}
    </div>
  );
};

export default History;
