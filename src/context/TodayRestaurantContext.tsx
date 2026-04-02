import { getHistory } from '@lib/api/calendar_api';
import { getRestaurantsWithName } from '@lib/api/supabase_api';
import {
  createContext,
  Dispatch,
  useReducer,
  useContext,
  useEffect,
} from 'react';
import type { Restaurant } from '@src/types';

type TodayRestaurantAction =
  | { type: 'selectRestaurant'; payload: Restaurant }
  | { type: 'deleteEvent' };

interface TodayRestaurantState {
  todayRestaurant: Restaurant | null;
}

const initialState: TodayRestaurantState = {
  todayRestaurant: null,
};

function todayRestaurantReducer(
  prevState: TodayRestaurantState,
  action: TodayRestaurantAction,
): TodayRestaurantState {
  switch (action.type) {
    case 'selectRestaurant': {
      return {
        ...prevState,
        todayRestaurant: { ...action.payload },
      };
    }

    case 'deleteEvent': {
      return {
        ...prevState,
        todayRestaurant: null,
      };
    }
    default:
      return prevState;
  }
}

const TodayRestaurantStatContext = createContext<TodayRestaurantState | undefined>(undefined);

const TodayRestaurantDispatchContext = createContext<Dispatch<TodayRestaurantAction> | undefined>(undefined);

export const TodayRestaurantProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  const [todayRestaurantState, todayRestaurantDispatch] = useReducer(
    todayRestaurantReducer,
    initialState,
  );

  useEffect(() => {
    const fetchTodayRestaurant = async () => {
      const restaurantName = (await getHistory()).items[0]?.summary;
      const todayRestaurant = (
        await getRestaurantsWithName([restaurantName])
      )[0];
      todayRestaurantDispatch({
        type: 'selectRestaurant',
        payload: todayRestaurant as unknown as Restaurant,
      });
    };

    fetchTodayRestaurant();
  }, [userId]);

  return (
    <TodayRestaurantStatContext.Provider value={todayRestaurantState}>
      <TodayRestaurantDispatchContext.Provider
        value={todayRestaurantDispatch}
      >
        {children}
      </TodayRestaurantDispatchContext.Provider>
    </TodayRestaurantStatContext.Provider>
  );
};

// Custom hooks to use the modal context
export const useTodayRestaurantState = () => {
  const context = useContext(TodayRestaurantStatContext);
  if (context === undefined) {
    throw new Error(
      'useTodayRestaurantState must be used within a TodayRestaurantProvider',
    );
  }
  return context;
};

export const useTodayRestaurantDispatch = () => {
  const context = useContext(TodayRestaurantDispatchContext);
  if (context === undefined) {
    throw new Error(
      'useTodayRestaurantDispatch must be used within a TodayRestaurantProvider',
    );
  }
  return context;
};
