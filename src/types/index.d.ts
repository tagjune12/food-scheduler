type Restaurant = {
  name: string;
  tags: string[];
  address: string;
  period: number;
  position?: {
    x: string;
    y: string;
  };
  visit?: string;
  place_url?: string;
  id?: string;
  distance?: string;
};

type HistoryType = {
  [key: string]: {
    date: string;
    eventId: string;
  };
};

type JSONResponse = {
  [key: string]: any;
};
type NestObjType = {
  [key: string]: Object;
};

type StringKeyObj = {
  [key: string]: any;
};

type AppStoreType = {
  state: {
    [key: string]: any;
  };
  userId?: string;
};

export type {
  Restaurant,
  HistoryType,
  JSONResponse,
  NestObjType,
  StringKeyObj,
  AppStoreType,
};
