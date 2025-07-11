import { getHistory } from '@lib/api/calendar_api';
import { getRestaurantsWithName } from '@lib/api/supabase_api';
import {
  createContext,
  Dispatch,
  useReducer,
  useContext,
  useEffect,
} from 'react';

interface TodayRestaurantState {
  todayRestaurant: any;
}

const initialState: TodayRestaurantState = {
  todayRestaurant: {},
};

function todayRestaurantReducer(prevState: TodayRestaurantState, action: any) {
  switch (action.type) {
    case 'selectRestaurant': {
      const result = {
        ...prevState,
        todayRestaurant: { ...action.payload },
      };

      return result;
    }

    case 'deleteEvent': {
      const result = {
        ...prevState,
        todayRestaurant: {},
      };

      return result;
    }
    default:
      return prevState;
  }
}

const TodayRestaurantStatContext = createContext<any>({
  state: initialState,
});

const TodayRestaurantDispatchContext = createContext<{
  dispatch: Dispatch<any>;
}>({
  dispatch: () => {},
});

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
    console.log('context userId', userId);
    const fetchTodayRestaurant = async () => {
      const restaurantName = (await getHistory()).items[0]?.summary;
      console.log('restaurantName', restaurantName);
      const todayRestaurant = (
        await getRestaurantsWithName([restaurantName])
      )[0];
      console.log('todayRestaurant', todayRestaurant);
      todayRestaurantDispatch({
        type: 'selectRestaurant',
        payload: todayRestaurant,
      });
    };

    fetchTodayRestaurant();
  }, [userId]);

  return (
    <TodayRestaurantStatContext.Provider value={todayRestaurantState}>
      <TodayRestaurantDispatchContext.Provider
        value={{ dispatch: todayRestaurantDispatch }}
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
  return context.dispatch;
};
