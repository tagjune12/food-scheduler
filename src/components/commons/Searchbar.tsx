import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { useState } from 'react';
import { searchRestaurantwithName } from '@lib/api/supabase_api';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function Searchbar({
  callbackFn,
}: {
  callbackFn: (params: any) => void;
}) {
  const [searchValue, setSearchValue] = useState('');
  return (
    <Search>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="검색"
        inputProps={{ 'aria-label': 'search' }}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
        onKeyDown={async (e) => {
          if (e.key === 'Enter') {
            if (searchValue.length < 2) {
              alert('검색어는 2글자 이상이어야 합니다.');
              return;
            }

            console.log(searchValue);
            // const result = await searchLocalPlaces(searchValue);
            // console.log(result);
            const result = await searchRestaurantwithName(searchValue);
            console.log(result);
            callbackFn(result);
          }
        }}
      />
    </Search>
  );
}
