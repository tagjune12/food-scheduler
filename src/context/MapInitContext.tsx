import { createContext, Dispatch, useReducer, useContext } from 'react';

interface MapInitState {
  initialized: boolean;
  access_token: string | null;
}

const initialState: MapInitState = {
  initialized: false,
  access_token: null,
};

type MapInitAction = { type: 'setAccessToken'; payload: string };

function mapInitReducer(prevState: MapInitState, action: MapInitAction): MapInitState {
  switch (action.type) {
    case 'setAccessToken': {
      const result = {
        ...prevState,
        access_token: action.payload,
        initialized: true,
      };
      return result;
    }

    default:
      return prevState;
  }
}

export const MapInitContext = createContext<{ initialized: boolean }>({
  initialized: false,
});

const MapInitDispatchContext = createContext<Dispatch<MapInitAction> | undefined>(undefined);

export const MapInitProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mapInitState, mapInitDispatch] = useReducer(
    mapInitReducer,
    initialState,
  );
  return (
    <MapInitContext.Provider value={mapInitState}>
      <MapInitDispatchContext.Provider value={mapInitDispatch}>
        {children}
      </MapInitDispatchContext.Provider>
    </MapInitContext.Provider>
  );
};

// Custom hooks to use the modal context
export const useMapInitState = () => {
  const context = useContext(MapInitContext);
  if (context === undefined) {
    throw new Error('useMapInitState must be used within a MapInitProvider');
  }
  return context;
};

export const useMapInitDispatch = () => {
  const context = useContext(MapInitDispatchContext);
  if (context === undefined) {
    throw new Error('useMapInitDispatch must be used within a MapInitProvider');
  }
  return context;
};
