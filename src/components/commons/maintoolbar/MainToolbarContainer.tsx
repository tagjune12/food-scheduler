import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  searchRestaurantwithName,
  searchRestaurantsByTag,
} from '@lib/api/supabase_api';
import { removeStoredUserId } from '@lib/util';
import { useAuth } from '@src/context/AuthContext';
import MainToolbar from './MainToolbar';

interface MainToolbarContainerProps {
  showCalendar: () => void;
  showSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}

const MainToolbarContainer = ({
  showCalendar,
  showSidebar,
}: MainToolbarContainerProps) => {
  const [inputValue, setInputValue] = React.useState<string>('');
  const [options, setOptions] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [highlightIndex, setHighlightIndex] = React.useState<number>(-1);
  const [tags, setTags] = React.useState<string[]>([]);
  const tagsContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [tagsWidth, setTagsWidth] = React.useState<number>(0);
  const [searchOpen, setSearchOpen] = React.useState<boolean>(false);
  const { isLogin, setIsLogin } = useAuth();

  const navigate = useNavigate();

  React.useLayoutEffect(() => {
    const measure = () => {
      setTagsWidth(tagsContainerRef.current?.offsetWidth ?? 0);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tags]);

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags((prev) => [...prev, trimmedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.startsWith('#') && value.includes(' ')) {
      const spaceIndex = value.indexOf(' ');
      const tagPart = value.substring(1, spaceIndex);
      const remainingPart = value.substring(spaceIndex + 1);

      if (tagPart.trim()) {
        addTag(tagPart.trim());
        setInputValue(remainingPart);
        return;
      }
    }

    setInputValue(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  useEffect(() => {
    const handler = setTimeout(async () => {
      const keyword = inputValue.trim();
      const hasActiveTags = tags.length > 0;

      if (!hasActiveTags && keyword.length === 0) {
        setOptions([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        let result: any[] = [];

        if (hasActiveTags) {
          const resultsList = await Promise.all(
            tags.map((tag) => searchRestaurantsByTag(tag, keyword)),
          );
          let intersection: any[] = (resultsList[0] ?? []) as any[];
          for (let i = 1; i < resultsList.length; i += 1) {
            const list = resultsList[i] ?? [];
            const ids = new Set(list.map((r: any) => r.id));
            intersection = intersection.filter((r: any) => ids.has(r.id));
          }
          result = intersection.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id),
          );
        } else if (keyword.startsWith('#')) {
          const [tagToken, ...restTokens] = keyword.split(/\s+/);
          const tag = tagToken.slice(1);
          const nameKeyword = restTokens.join(' ');
          result = await searchRestaurantsByTag(tag, nameKeyword);
        } else if (keyword.length > 0) {
          result = await searchRestaurantwithName(keyword);
        }

        setOptions(result ?? []);
        setOpen(true);
      } catch {
        setOptions([]);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [inputValue, tags]);

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
    if (!window.confirm('로그아웃 하시겠습니까?')) {
      return;
    }
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_expiry');
      removeStoredUserId();
      setIsLogin(false);
    } finally {
      // 필요 시 navigate('/login', { replace: true });
    }
  };

  const navigateToLogin = () => navigate('/login');

  return (
    <MainToolbar
      showCalendar={showCalendar}
      showSidebar={showSidebar}
      inputValue={inputValue}
      options={options}
      open={open}
      loading={loading}
      highlightIndex={highlightIndex}
      tags={tags}
      tagsWidth={tagsWidth}
      searchOpen={searchOpen}
      isLogin={isLogin}
      tagsContainerRef={tagsContainerRef}
      handleInputChange={handleInputChange}
      handleKeyDown={handleKeyDown}
      handleSelect={handleSelect}
      handleLogout={handleLogout}
      removeTag={removeTag}
      setOpen={setOpen}
      setSearchOpen={setSearchOpen}
      setInputValue={setInputValue}
      setTags={setTags}
      setHighlightIndex={setHighlightIndex}
      navigateToLogin={navigateToLogin}
    />
  );
};

export default MainToolbarContainer;
