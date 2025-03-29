declare namespace kakao.maps {
  export class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
  }

  export class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  export class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
    setImage(image: MarkerImage): void;
  }

  export class MarkerImage {
    constructor(src: string, size: Size, options?: MarkerImageOptions);
  }

  export class Size {
    constructor(width: number, height: number);
  }

  export class Point {
    constructor(x: number, y: number);
  }

  export class CustomOverlay {
    constructor(options: CustomOverlayOptions);
    setMap(map: Map | null): void;
  }

  export interface MapOptions {
    center: LatLng;
    level: number;
  }

  export interface MarkerOptions {
    position: LatLng;
    map?: Map;
  }

  export interface MarkerImageOptions {
    offset?: Point;
  }

  export interface CustomOverlayOptions {
    position: LatLng;
    content: HTMLElement;
    yAnchor?: number;
    clickable?: boolean;
  }

  export namespace event {
    export function addListener(
      target: any,
      type: string,
      handler: Function,
    ): void;
  }

  export function load(callback: () => void): void;

  // 서비스 모듈 정의 추가
  export namespace services {
    export class Places {
      constructor();
      categorySearch(
        categoryCode: string,
        callback: (
          data: PlacesSearchResult[],
          status: Status,
          pagination: Pagination,
        ) => void,
        options?: CategorySearchOptions,
      ): void;
      keywordSearch(
        keyword: string,
        callback: (
          data: PlacesSearchResult[],
          status: Status,
          pagination: Pagination,
        ) => void,
        options?: KeywordSearchOptions,
      ): void;
    }

    export interface PlacesSearchResult {
      address_name: string;
      category_group_code: string;
      category_group_name: string;
      category_name: string;
      distance: string;
      id: string;
      phone: string;
      place_name: string;
      place_url: string;
      road_address_name: string;
      x: string;
      y: string;
    }

    export enum Status {
      OK = 'OK',
      ZERO_RESULT = 'ZERO_RESULT',
      ERROR = 'ERROR',
    }

    export interface Pagination {
      current: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }

    export interface KeywordSearchOptions {
      location?: LatLng;
      radius?: number;
      bounds?: LatLngBounds;
      size?: number;
      sort?: SortBy;
      useMapBounds?: boolean;
      page?: number;
    }

    export interface CategorySearchOptions {
      location?: LatLng;
      radius?: number;
      bounds?: LatLngBounds;
      size?: number;
      useMapBounds?: boolean;
      page?: number;
    }

    export enum SortBy {
      DISTANCE = 'distance',
      ACCURACY = 'accuracy',
    }
  }

  export class LatLngBounds {
    constructor(sw: LatLng, ne: LatLng);
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
    contain(latlng: LatLng): boolean;
  }
}

declare global {
  interface Window {
    kakao: {
      maps: typeof kakao.maps;
    };
  }
}
