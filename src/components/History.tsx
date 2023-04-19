import React, { useState, useEffect, useContext } from 'react';
import RestaurantCard from '@components/commons/RestaurantCard';
import restaurants from '@data/restaurants.json';
import last_visit_data from '@data/restaurants copy.json';
import { HistoryType, Restaurant, StringKeyObj } from 'types';
// import { HistoryContext } from '@src/App';
import { HistoryContext } from '../App'; // 절대경로 적용 문제 발생

type HistoryProps = {
  setTodayRestaurant: (arg: Restaurant) => void;
};

const History = ({ setTodayRestaurant }: HistoryProps) => {
  /*
  // const [data, setData] = useState<Object[]>([]);

  // useEffect(() => {
  //   // const keys: string[] = Object.keys(history);
  //   // console.log(`히스토리   ${JSON.stringify(history)}      ${keys}`);
  //   // setData(
  //   //   keys.map((key) => ({ ...test[key], visit: history[key], name: key })),
  //   // );
  //   // console.log('응애ㅐㅐㅐㅐㅐㅐㅐㅐㅐ', data);
  // }, [history]);
  */
  const history = useContext(HistoryContext);

  return (
    <div>
      {restaurants.map((restaurant, index) => {
        // const lastVisit: StringKeyObj = last_visit_data;
        return (
          <RestaurantCard
            key={restaurant.name}
            restaurant={restaurant}
            visit={history[restaurant.name]}
            setTodayRestaurant={setTodayRestaurant}
          />
        );
      })}
    </div>
  );
};

export default History;
