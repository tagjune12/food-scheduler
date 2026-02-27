import React from 'react';
import { PlaceFilter } from '@pages/MainPage';
import { FilterOption } from './Map';

interface FilterButtonProps {
  option: FilterOption;
  placeFilter: PlaceFilter;
  onFilterChange: (filter: PlaceFilter) => void;
}

const FilterButton = ({
  option,
  placeFilter,
  onFilterChange,
}: FilterButtonProps) => {
  return (
    <button
      onClick={() => onFilterChange(option.value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        backgroundColor: placeFilter === option.value ? option.color : 'white',
        color: placeFilter === option.value ? 'white' : option.color,
        border: `1px solid ${option.color}`,
        borderRadius: '20px',
        cursor: 'pointer',
        fontWeight: placeFilter === option.value ? 'bold' : 'normal',
        fontSize: '14px',
        transition: 'all 0.3s ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (placeFilter !== option.value) {
          e.currentTarget.style.backgroundColor = `${option.color}20`;
        }
      }}
      onMouseLeave={(e) => {
        if (placeFilter !== option.value) {
          e.currentTarget.style.backgroundColor = 'white';
        }
      }}
    >
      <span>{option.icon}</span>
      <span>{option.label}</span>
    </button>
  );
};

export default FilterButton;
