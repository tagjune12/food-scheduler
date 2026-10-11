import {
  createContext,
  useContext,
  useReducer,
  Dispatch,
  useEffect,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBookmarks,
  insertBookmark,
  deleteBookmark,
} from '@src/lib/api/supabase_api';
import { useAuth } from '@src/context/AuthContext';

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
  userId: string;
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

// 리듀서는 북마크 목록만 관리하고, userId는 AuthContext에서 매 렌더 가져온다
type BookmarkReducerState = Omit<BookmarkState, 'userId'>;

const initialState: BookmarkReducerState = {
  bookmarks: [],
  loading: false,
  error: null,
};

// 리듀서 함수
function bookmarkReducer(
  prevState: BookmarkReducerState,
  action: BookmarkAction,
): BookmarkReducerState {
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
}: {
  children: React.ReactNode;
}) => {
  const { userId } = useAuth();
  const [reducerState, dispatch] = useReducer(bookmarkReducer, initialState);
  const state: BookmarkState = useMemo(
    () => ({ ...reducerState, userId }),
    [reducerState, userId],
  );

  // 로그인 사용자가 바뀔 때 북마크 목록 조회
  useEffect(() => {
    // 로그아웃하면 이전 사용자의 북마크가 화면에 남지 않게 비운다
    if (!userId) {
      dispatch({ type: 'FETCH_BOOKMARKS_SUCCESS', payload: [] });
      return;
    }

    // 응답 전에 로그아웃하거나 계정이 바뀌면 이전 사용자의 결과를 버린다
    let isCancelled = false;
    const fetchBookmarks = async () => {
      dispatch({ type: 'FETCH_BOOKMARKS_START' });
      try {
        const bookmarks: BookmarkItem[] = await getBookmarks();
        if (isCancelled) {
          return;
        }
        dispatch({ type: 'FETCH_BOOKMARKS_SUCCESS', payload: bookmarks || [] });
      } catch (error) {
        if (isCancelled) {
          return;
        }
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
    return () => {
      isCancelled = true;
    };
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
  const state = useContext(BookmarkStateContext);

  if (dispatch === undefined || state === undefined) {
    throw new Error(
      'useBookMarkActions must be used within a BookmarkProvider',
    );
  }

  const { userId } = state;
  const navigate = useNavigate();

  // 비로그인 상태에서는 RLS가 쓰기를 거부하므로 API를 부르지 않고 로그인으로 안내한다
  const confirmLogin = () => {
    if (window.confirm('로그인이 필요합니다. 로그인하시겠습니까?')) {
      navigate('/login', { replace: true });
    }
  };

  // 북마크 추가 함수. API가 오류 없이 응답했을 때만 true를 반환한다
  const addBookmark = async (
    placeId: string,
    bookmarkData: BookmarkItem,
  ): Promise<boolean> => {
    if (!userId) {
      confirmLogin();
      return false;
    }

    dispatch({ type: 'ADD_BOOKMARK_START' });
    try {
      const result = await insertBookmark(placeId);
      if (result === null) {
        dispatch({
          type: 'ADD_BOOKMARK_ERROR',
          payload: '북마크 추가에 실패했습니다.',
        });
        alert('북마크 추가에 실패했습니다.');
        return false;
      }
      dispatch({ type: 'ADD_BOOKMARK_SUCCESS', payload: bookmarkData });
      return true;
    } catch (error) {
      dispatch({
        type: 'ADD_BOOKMARK_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : '북마크 추가에 실패했습니다.',
      });
      return false;
    }
  };

  // 북마크 삭제 함수. API가 오류 없이 응답했을 때만 true를 반환한다
  const removeBookmark = async (placeId: string): Promise<boolean> => {
    if (!userId) {
      confirmLogin();
      return false;
    }

    dispatch({ type: 'REMOVE_BOOKMARK_START' });
    try {
      const result = await deleteBookmark(placeId);
      if (result === null) {
        dispatch({
          type: 'REMOVE_BOOKMARK_ERROR',
          payload: '북마크 삭제에 실패했습니다.',
        });
        alert('북마크 삭제에 실패했습니다.');
        return false;
      }
      dispatch({ type: 'REMOVE_BOOKMARK_SUCCESS', payload: placeId });
      return true;
    } catch (error) {
      dispatch({
        type: 'REMOVE_BOOKMARK_ERROR',
        payload:
          error instanceof Error
            ? error.message
            : '북마크 삭제에 실패했습니다.',
      });
      return false;
    }
  };

  return {
    addBookmark,
    removeBookmark,
  };
};
