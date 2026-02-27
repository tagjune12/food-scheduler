import React from 'react';
import './Map.scss'; // 로컬 스타일시트 호출
import ListModal from '@components/ListModal';
import { PlaceFilter } from '@pages/MainPage';
import FilterButton from './FilterButton';

export interface FilterOption {
  value: PlaceFilter;
  label: string;
  icon: string;
  color: string;
}

interface MapProps {
  placeFilter: PlaceFilter;
  onFilterChange: (filter: PlaceFilter) => void;
  filterOptions: FilterOption[];
  showListModal: boolean;
  onCloseListModal: () => void;
  clusterRestaurants: any[];
}

const Map = ({
  placeFilter,
  onFilterChange,
  filterOptions,
  showListModal,
  onCloseListModal,
  clusterRestaurants,
}: MapProps) => {
  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div id="map" className="kakao-map" />
      </div>

      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 1200, // 모달(1300) 아래, 지도(기본 0) 위
          backgroundColor: 'white',
          borderRadius: '25px',
          padding: '4px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
        }}
      >
        {filterOptions.map((option) => (
          <FilterButton
            key={option.value}
            option={option}
            placeFilter={placeFilter}
            onFilterChange={onFilterChange}
          />
        ))}
      </div>

      <ListModal
        open={showListModal}
        handleClose={onCloseListModal}
        restaurants={clusterRestaurants}
      />
    </>
  );
};

export default Map;
