import {
  createContext,
  useContext,
  useReducer,
  Dispatch,
  useEffect,
} from 'react';
import {
  getBookmarks,
  insertBookmark,
  deleteBookmark,
} from '@src/lib/api/supabase_api';

// 북마크 아이템 타입 정의
interface BookmarkItem {
  id: string | null;
  address_name: string | null;
  category_group_code?: string | null;
  category_group_name?: string | null;
  category_name: string | null;
  latitude?: string | null;
  longitude?: string | null;
  phone?: string | null;
  place_name: string | null;
  place_url: string | null;
  road_address_name?: string | null;
}

// 북마크 상태 타입 정의
interface BookmarkState {
  bookmarks: BookmarkItem[];
  loading: boolean;
  error: string | null;
}

// 액션 타입 정의
type BookmarkAction =
  | { type: 'FETCH_BOOKMARKS_START' }
  | { type: 'FETCH_BOOKMARKS_SUCCESS'; payload: BookmarkItem[] }
  | { type: 'FETCH_BOOKMARKS_ERROR'; payload: string }
  | { type: 'ADD_BOOKMARK_START' }
  | { type: 'ADD_BOOKMARK_SUCCESS'; payload: BookmarkItem }
  | { type: 'ADD_BOOKMARK_ERROR'; payload: string }
  | { type: 'REMOVE_BOOKMARK_START' }
  | { type: 'REMOVE_BOOKMARK_SUCCESS'; payload: string }
  | { type: 'REMOVE_BOOKMARK_ERROR'; payload: string };

// 초기 상태
const initialState: BookmarkState = {
  bookmarks: [],
  loading: false,
  error: null,
};

// 리듀서 함수
function bookmarkReducer(
  prevState: BookmarkState,
  action: BookmarkAction,
): BookmarkState {
  switch (action.type) {
    case 'FETCH_BOOKMARKS_START':
    case 'ADD_BOOKMARK_START':
    case 'REMOVE_BOOKMARK_START':
      return {
        ...prevState,
        loading: true,
        error: null,
      };

    case 'FETCH_BOOKMARKS_SUCCESS':
      return {
        ...prevState,
        bookmarks: action.payload,
        loading: false,
        error: null,
      };

    case 'ADD_BOOKMARK_SUCCESS':
      return {
        ...prevState,
        bookmarks: [...prevState.bookmarks, action.payload],
        loading: false,
        error: null,
      };

    case 'REMOVE_BOOKMARK_SUCCESS':
      return {
        ...prevState,
        bookmarks: prevState.bookmarks.filter(
          (bookmark) => bookmark.id !== action.payload,
        ),
        loading: false,
        error: null,
      };

    case 'FETCH_BOOKMARKS_ERROR':
    case 'ADD_BOOKMARK_ERROR':
    case 'REMOVE_BOOKMARK_ERROR':
      return {
        ...prevState,
        loading: false,
        error: action.payload,
      };

    default:
      return prevState;
  }
}

// Context 생성
const BookmarkStateContext = createContext<BookmarkState | undefined>(
  undefined,
);
const BookmarkDispatchContext = createContext<
  Dispatch<BookmarkAction> | undefined
>(undefined);

// Provider 컴포넌트
export const BookmarkProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  const [state, dispatch] = useReducer(bookmarkReducer, initialState);

  // 컴포넌트 마운트 시 북마크 목록 조회
  useEffect(() => {
    console.log('userId', userId);
    const fetchBookmarks = async () => {
      if (!userId) return;

      dispatch({ type: 'FETCH_BOOKMARKS_START' });
      try {
        const bookmarks: BookmarkItem[] = await getBookmarks(userId);
        dispatch({ type: 'FETCH_BOOKMARKS_SUCCESS', payload: bookmarks || [] });
      } catch (error) {
        dispatch({
          type: 'FETCH_BOOKMARKS_ERROR',
          payload:
            error instanceof Error
              ? error.message
              : '북마크를 불러오는데 실패했습니다.',
        });
      }
    };

    fetchBookmarks();
  }, [userId]);

  return (
    <BookmarkStateContext.Provider value={state}>
      <BookmarkDispatchContext.Provider value={dispatch}>
        {children}
      </BookmarkDispatchContext.Provider>
    </BookmarkStateContext.Provider>
  );
};

// 상태를 사용하는 커스텀 훅
export const useBookMarkState = () => {
  const context = useContext(BookmarkStateContext);
  if (context === undefined) {
    throw new Error('useBookMarkState must be used within a BookmarkProvider');
  }
  return context;
};

// 액션을 사용하는 커스텀 훅
export const useBookMarkActions = () => {
  const dispatch = useContext(BookmarkDispatchContext);
  if (dispatch === undefined) {
    throw new Error(
      'useBookMarkActions must be used within a BookmarkProvider',
    );
  }

  // 북마크 추가 함수
  const addBookmark = async (
    userId: string,
    placeId: string,
    bookmarkData: BookmarkItem,
  ) => {
    dispatch({ type: 'ADD_BOOKMARK_START' });
    try {
      await insertBookmark(userId, placeId);
      dispatch({ type: 'ADD_BOOKMARK_SUCCESS', payload: bookmarkData });
    } catch (error) {
      dispatch({
        type: 'ADD_BOOKMARK_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : '북마크 추가에 실패했습니다.',
      });
    }
  };

  // 북마크 삭제 함수
  const removeBookmark = async (userId: string, placeId: string) => {
    dispatch({ type: 'REMOVE_BOOKMARK_START' });
    try {
      await deleteBookmark(userId, placeId);
      dispatch({ type: 'REMOVE_BOOKMARK_SUCCESS', payload: placeId });
    } catch (error) {
      dispatch({
        type: 'REMOVE_BOOKMARK_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : '북마크 삭제에 실패했습니다.',
      });
    }
  };

  // 북마크 조회 함수
  const fetchBookmarks = async (userId: string) => {
    dispatch({ type: 'FETCH_BOOKMARKS_START' });
    try {
      const bookmarks: BookmarkItem[] = await getBookmarks(userId);
      dispatch({ type: 'FETCH_BOOKMARKS_SUCCESS', payload: bookmarks || [] });
    } catch (error) {
      dispatch({
        type: 'FETCH_BOOKMARKS_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : '북마크를 새로고침하는데 실패했습니다.',
      });
    }
  };

  return {
    addBookmark,
    removeBookmark,
    fetchBookmarks,
  };
};
