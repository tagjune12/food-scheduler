type Restaurant = {
  name: string;
  tags: string[];
  address: string;
  period: number;
  position?: Object;
  visit: string;
};

type HistoryType = {
  [key: string]: string;
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
};

export type {
  Restaurant,
  HistoryType,
  JSONResponse,
  NestObjType,
  StringKeyObj,
  AppStoreType,
};
