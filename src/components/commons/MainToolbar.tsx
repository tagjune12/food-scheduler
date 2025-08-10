import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import { searchRestaurantwithName } from '@lib/api/supabase_api';
import { useEffect } from 'react';
import { removeStoredUserId } from '@lib/util';

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
    // width: 'auto',
    width: '500px',
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
  // color: 'inherit',
  color: 'white',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    // [theme.breakpoints.up('md')]: {
    //   width: '100%',
    // },
  },
  width: '100%',
}));

export default function MainToolbar({
  showCalendar,
  showSidebar,
}: {
  showCalendar: () => void;
  showSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [inputValue, setInputValue] = React.useState<string>('');
  const [options, setOptions] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [highlightIndex, setHighlightIndex] = React.useState<number>(-1);

  // 디바운스 검색
  useEffect(() => {
    const handler = setTimeout(async () => {
      const keyword = inputValue.trim();
      if (keyword.length === 0) {
        setOptions([]);
        setOpen(false);
        return;
      }
      setLoading(true);
      try {
        const result = await searchRestaurantwithName(keyword);
        setOptions(result ?? []);
        setOpen(true);
      } catch (e) {
        setOptions([]);
        setOpen(true); // 열어두고 "결과 없음" 표시
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [inputValue]);

  // 옵션 변경 시 하이라이트 초기화
  useEffect(() => {
    setHighlightIndex(options.length > 0 ? 0 : -1);
  }, [options]);

  const handleSelect = (option: any) => {
    setInputValue(option?.place_name ?? '');
    setOpen(false);
    const event = new CustomEvent('openPlaceFromSearch', { detail: option });
    window.dispatchEvent(event);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);
    const hasOptions = options.length > 0;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!hasOptions) return;
        setHighlightIndex((prev) => (prev + 1) % options.length);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!hasOptions) return;
        setHighlightIndex(
          (prev) => (prev - 1 + options.length) % options.length,
        );
        break;
      }
      case 'Enter': {
        if (hasOptions && highlightIndex >= 0) {
          e.preventDefault();
          handleSelect(options[highlightIndex]);
        }
        break;
      }
      case 'Escape': {
        setOpen(false);
        break;
      }
      default:
        break;
    }
  };

  const handleLogout = () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    try {
      // 토큰/만료시간/유저ID 제거
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expiry');
      removeStoredUserId();
    } finally {
      // 로그인 페이지로 이동
      window.location.href = '/login';
    }
  };

  const showNoResult =
    !loading && open && options.length === 0 && inputValue.trim().length > 0;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ backgroundColor: '#845EC2' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={() => showSidebar((prev) => !prev)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            뭐먹지..?
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="검색(태그검색: #태그명)"
              inputProps={{ 'aria-label': 'search' }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={handleKeyDown}
            />
            {open && (
              <Paper
                elevation={6}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  maxHeight: 360,
                  overflowY: 'auto',
                  zIndex: (theme) => theme.zIndex.modal,
                }}
              >
                {loading ? (
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}
                  >
                    <CircularProgress size={16} />
                    <span>검색 중...</span>
                  </Box>
                ) : showNoResult ? (
                  <Box sx={{ p: 2, color: 'text.secondary' }}>결과 없음</Box>
                ) : (
                  <List>
                    {options.map((opt: any, idx: number) => (
                      <ListItemButton
                        key={opt.id}
                        selected={idx === highlightIndex}
                        onMouseEnter={() => setHighlightIndex(idx)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(opt)}
                      >
                        <ListItemText
                          primary={opt.place_name}
                          secondary={
                            opt.road_address_name || opt.address_name || ''
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </Paper>
            )}
          </Search>
          <Button
            color="inherit"
            sx={{ color: 'white' }}
            onClick={showCalendar}
          >
            calendar
          </Button>
          <Button
            color="inherit"
            sx={{ color: 'white' }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
