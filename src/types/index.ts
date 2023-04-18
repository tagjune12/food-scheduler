type Restaurant = {
  name: string;
  tags: string[];
  address: string;
  period: number;
  position?: Object;
  visit: string;
};

type HistoryType = {
  [prop: string]: string;
};

type JSONResponse = {
  [prop: string]: any;
};
type NestObjType = {
  [key: string]: Object;
};

type StringKeyObj = {
  [key: string]: any;
};

export type {
  Restaurant,
  HistoryType,
  JSONResponse,
  NestObjType,
  StringKeyObj,
};
