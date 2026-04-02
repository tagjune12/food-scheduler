import type { Database } from './supabase';

type PlaceRow = Database['public']['Tables']['places']['Row'];
type PlaceWithBookmark =
  Database['public']['Functions']['get_places_with_bookmarks']['Returns'][number];

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

type JSONResponse = Record<string, unknown>;

type NestObjType = Record<string, object>;

type StringKeyObj = Record<string, unknown>;

type AppStoreType = {
  state: {
    histories: HistoryType;
    [key: string]: unknown;
  };
  userId?: string;
};

export type {
  Restaurant,
  PlaceRow,
  PlaceWithBookmark,
  HistoryType,
  JSONResponse,
  NestObjType,
  StringKeyObj,
  AppStoreType,
};
