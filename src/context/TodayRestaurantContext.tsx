import { createContext, Dispatch, useReducer, useContext } from 'react';

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
}: {
  children: React.ReactNode;
}) => {
  const [todayRestaurantState, todayRestaurantDispatch] = useReducer(
    todayRestaurantReducer,
    initialState,
  );
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
