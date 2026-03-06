import * as React from 'react';

import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

import './MainToolbar.scss';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(1),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: '300px',
  },
  [theme.breakpoints.up('md')]: {
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
  color: 'white',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
  width: '100%',
}));

export interface MainToolbarProps {
  showCalendar: () => void;
  showSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  inputValue: string;
  options: any[];
  open: boolean;
  loading: boolean;
  highlightIndex: number;
  tags: string[];
  tagsWidth: number;
  searchOpen: boolean;
  isLogin: boolean;
  tagsContainerRef: React.RefObject<HTMLDivElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSelect: (option: any) => void;
  handleLogout: () => void;
  removeTag: (tag: string) => void;
  setOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setInputValue: (value: string) => void;
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  setHighlightIndex: (index: number) => void;
  navigateToLogin: () => void;
}

const MainToolbar = ({
  showCalendar,
  showSidebar,
  inputValue,
  options,
  open,
  loading,
  highlightIndex,
  tags,
  tagsWidth,
  searchOpen,
  isLogin,
  tagsContainerRef,
  handleInputChange,
  handleKeyDown,
  handleSelect,
  handleLogout,
  removeTag,
  setOpen,
  setSearchOpen,
  setInputValue,
  setTags,
  setHighlightIndex,
  navigateToLogin,
}: MainToolbarProps) => {
  const showNoResult =
    !loading && open && options.length === 0 && inputValue.trim().length > 0;

  const inputPaddingLeftPx = tags.length > 0 ? tagsWidth + 48 : undefined;

  const searchContent = (
    <>
      <SearchIconWrapper>
        <SearchIcon />
      </SearchIconWrapper>

      {tags.length > 0 && (
        <Box
          ref={tagsContainerRef}
          sx={{
            position: 'absolute',
            left: 40,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
            zIndex: 1,
          }}
        >
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={`#${tag}`}
              size="small"
              onDelete={() => removeTag(tag)}
              deleteIcon={<CloseIcon />}
              sx={{
                backgroundColor: alpha('#fff', 0.2),
                color: 'white',
                height: 24,
                fontSize: '0.75rem',
                '& .MuiChip-deleteIcon': {
                  color: 'white',
                  fontSize: '14px',
                },
              }}
            />
          ))}
        </Box>
      )}

      <StyledInputBase
        placeholder={
          tags.length > 0 ? '추가 검색어 입력...' : '검색(태그검색: #태그명)'
        }
        inputProps={{ 'aria-label': 'search' }}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        sx={{
          '& .MuiInputBase-input': {
            paddingLeft: inputPaddingLeftPx
              ? `${inputPaddingLeftPx}px`
              : undefined,
          },
        }}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
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
                    secondary={opt.road_address_name || opt.address_name || ''}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>
      )}
    </>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        {searchOpen ? (
          <Toolbar sx={{ backgroundColor: '#845EC2' }}>
            <Search sx={{ flexGrow: 1, margin: 0, width: '100%' }}>
              {searchContent}
            </Search>
            <IconButton
              color="inherit"
              onClick={() => {
                setSearchOpen(false);
                setInputValue('');
                setTags([]);
                setOpen(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        ) : (
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

            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, whiteSpace: 'nowrap' }}
            >
              뭐먹지..?
            </Typography>

            {/* 데스크탑 검색창 */}
            <Search sx={{ display: { xs: 'none', sm: 'block' } }}>
              {searchContent}
            </Search>

            {/* 모바일 검색 아이콘 */}
            <IconButton
              color="inherit"
              onClick={() => setSearchOpen(true)}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <SearchIcon />
            </IconButton>

            {/* 데스크탑 버튼 (텍스트) */}
            <Button
              color="inherit"
              sx={{ color: 'white', display: { xs: 'none', sm: 'flex' } }}
              onClick={showCalendar}
            >
              calendar
            </Button>
            {isLogin ? (
              <Button
                color="inherit"
                sx={{ color: 'white', display: { xs: 'none', sm: 'flex' } }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="inherit"
                sx={{ color: 'white', display: { xs: 'none', sm: 'flex' } }}
                onClick={navigateToLogin}
              >
                Login
              </Button>
            )}

            {/* 모바일 버튼 (아이콘) */}
            <IconButton
              color="inherit"
              onClick={showCalendar}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <CalendarMonthIcon />
            </IconButton>
            {isLogin ? (
              <IconButton
                color="inherit"
                onClick={handleLogout}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <LogoutIcon />
              </IconButton>
            ) : (
              <IconButton
                color="inherit"
                onClick={navigateToLogin}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <LoginIcon />
              </IconButton>
            )}
          </Toolbar>
        )}
      </AppBar>
    </Box>
  );
};

export default MainToolbar;
