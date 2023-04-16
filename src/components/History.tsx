import React, { useState, useEffect } from 'react';
import RestaurantCard from '@components/commons/RestaurantCard';
import restaurants from '@data/restaurants.json';
import test_data from '@data/restaurants copy.json';
import { HistoryType, Restaurant } from 'types';

type HistoryProps = {
  history: HistoryType;
};

type NestObjType = {
  [key: string]: Object;
};

const History = ({ history }: HistoryProps) => {
  const [data, setData] = useState<Object[]>([]);

  useEffect(() => {
    const keys: string[] = Object.keys(history);
    const test: NestObjType = test_data;
    // console.log(`히스토리   ${JSON.stringify(history)}      ${keys}`);
    setData(
      keys.map((key) => ({ ...test[key], visit: history[key], name: key })),
    );
    console.log('응애ㅐㅐㅐㅐㅐㅐㅐㅐㅐ', data);
  }, [history]);

  const addRestaurant = () => {
    console.log(`log from addRestaurant`);
  };

  return (
    <div>
      {data.map((kkk, index) => (
        <RestaurantCard
          key={index}
          restaurant={kkk as Restaurant}
          onBtnClick={addRestaurant}
        />
      ))}
    </div>
  );
};

export default History;
