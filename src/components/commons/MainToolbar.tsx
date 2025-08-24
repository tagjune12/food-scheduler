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
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import {
  searchRestaurantwithName,
  searchRestaurantsByTag,
} from '@lib/api/supabase_api';
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
  const [tags, setTags] = React.useState<string[]>([]);
  const tagsContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [tagsWidth, setTagsWidth] = React.useState<number>(0);

  // 태그 컨테이너 실제 너비 측정하여 입력 패딩에 반영
  React.useLayoutEffect(() => {
    const measure = () => {
      setTagsWidth(tagsContainerRef.current?.offsetWidth ?? 0);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tags]);

  const inputPaddingLeftPx = tags.length > 0 ? tagsWidth + 48 : undefined; // 아이콘 영역(약 48px) + 태그 너비

  // 태그 추가 함수
  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
    }
  };

  // 태그 삭제 함수
  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 카테고리명 입력 후 공백이 입력되면 태그로 변환
    if (value.startsWith('#') && value.includes(' ')) {
      const spaceIndex = value.indexOf(' ');
      const tagPart = value.substring(1, spaceIndex); // # 제거
      const remainingPart = value.substring(spaceIndex + 1);

      if (tagPart.trim()) {
        addTag(tagPart.trim());
        setInputValue(remainingPart);
        return;
      }
    }

    setInputValue(value);
  };

  // 키보드 입력 처리 (백스페이스로 태그 삭제)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 백스페이스로 태그 삭제
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      e.preventDefault();
      setTags((prev) => prev.slice(0, -1));
      return;
    }

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

  // 검색 로직 (태그와 입력값을 모두 고려)
  useEffect(() => {
    const handler = setTimeout(async () => {
      const keyword = inputValue.trim();
      const hasActiveTags = tags.length > 0;

      // 태그가 있거나 키워드가 있을 때만 검색
      if (!hasActiveTags && keyword.length === 0) {
        setOptions([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        let result: any[] = [];

        if (hasActiveTags) {
          // 여러 태그 AND 매칭: 모든 태그 조건을 만족하는 교집합
          const resultsList = await Promise.all(
            tags.map((tag) => searchRestaurantsByTag(tag, keyword)),
          );
          let intersection: any[] = (resultsList[0] ?? []) as any[];
          for (let i = 1; i < resultsList.length; i += 1) {
            const list = resultsList[i] ?? [];
            const ids = new Set(list.map((r: any) => r.id));
            intersection = intersection.filter((r: any) => ids.has(r.id));
          }
          // 중복 제거(안전)
          result = intersection.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id),
          );
        } else if (keyword.startsWith('#')) {
          // 해시태그 검색 (기존 로직)
          const [tagToken, ...restTokens] = keyword.split(/\s+/);
          const tag = tagToken.slice(1);
          const nameKeyword = restTokens.join(' ');
          result = await searchRestaurantsByTag(tag, nameKeyword);
        } else if (keyword.length > 0) {
          // 일반 검색
          result = await searchRestaurantwithName(keyword);
        }

        setOptions(result ?? []);
        setOpen(true);
      } catch (e) {
        setOptions([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [inputValue, tags]);

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

            {/* 태그 표시 영역 */}
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
                tags.length > 0
                  ? '추가 검색어 입력...'
                  : '검색(태그검색: #태그명)'
              }
              inputProps={{ 'aria-label': 'search' }}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={handleKeyDown}
              sx={{
                // 입력 내부 패딩을 동적으로 조정해 태그와 키워드 간격을 최소화
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
