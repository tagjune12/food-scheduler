import { createClient } from '@supabase/supabase-js';
import { Database } from '@src/types/supabase';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { flowType: 'pkce' },
});

export const getRestaurants = async (categoryFilter?: string) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase.from('places').select('*');

    // 카테고리 필터 적용
    if (categoryFilter === 'cafe') {
      query = query.eq('category_group_code', 'CE7');
    } else if (categoryFilter === 'restaurant' || !categoryFilter) {
      query = query.eq('category_group_code', 'FD6');
    } else if (categoryFilter === 'all') {
      query = query.in('category_group_code', ['FD6', 'CE7']);
    }

    const { data, error } = await query.order('place_name', {
      ascending: true,
    });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    return [];
  }
};

export const getRestaurantsWithName = async (names: string[]) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .in('category_group_code', ['FD6', 'CE7'])
      .in('place_name', names);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    return [];
  }
};

export const searchRestaurantwithName = async (
  keyword: string,
  categoryFilter?: string,
) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase.from('places').select('*');

    // 카테고리 필터 적용
    if (categoryFilter === 'cafe') {
      query = query.eq('category_group_code', 'CE7');
    } else if (categoryFilter === 'restaurant') {
      query = query.eq('category_group_code', 'FD6');
    } else {
      // 기본값: 식당과 카페 모두 검색
      query = query.in('category_group_code', ['FD6', 'CE7']);
    }

    const { data, error } = await query.ilike(
      'place_name',
      `%${keyword.trim()}%`,
    );

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    return [];
  }
};

export const getRestaurantsWithPagination = async (
  page: number,
  dataPerPage: number,
) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('category_group_code', 'FD6')
      .range(page * dataPerPage, (page + 1) * dataPerPage - 1);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    return [];
  }
};

export const insertBookmark = async (placeId: string) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // user_id는 DB 기본값 auth.uid()로 채워진다
    const { data, error } = await supabase
      .from('user_bookmarks')
      .upsert(
        { place_id: placeId },
        { onConflict: 'user_id,place_id', ignoreDuplicates: true },
      )
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in insertBookmark:', error);
    return null;
  }
};

export const getBookmarks = async () => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select(
        'created_at, places(id,address_name,category_group_code,category_group_name,category_name,latitude,longitude,phone,place_name,place_url,road_address_name)',
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return (data ?? []).flatMap((bookmark) =>
      bookmark.places ? [bookmark.places] : [],
    );
  } catch (error) {
    console.error('Error in getBookmarks:', error);
    return [];
  }
};

export const deleteBookmark = async (placeId: string) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('place_id', placeId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in deleteBookmark:', error);
    return null;
  }
};

export const getPlacesWithUserBookmarks = async (categoryFilter?: string) => {
  const query = supabase.rpc('get_places_with_my_bookmarks');

  // 카테고리 필터 적용
  if (categoryFilter && categoryFilter !== 'all') {
    const categoryCode = categoryFilter === 'cafe' ? 'CE7' : 'FD6';
    query.eq('category_group_code', categoryCode);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch places: ${error.message}`);
  }

  return data;
};

export const getPlacesWithNameAndBookmarks = async (
  names: string[],
  categoryFilter?: string,
) => {
  const query = supabase.rpc('get_places_by_names_with_my_bookmarks', {
    p_place_names: names,
  });

  // 카테고리 필터 적용
  if (categoryFilter && categoryFilter !== 'all') {
    const categoryCode = categoryFilter === 'cafe' ? 'CE7' : 'FD6';
    query.eq('category_group_code', categoryCode);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch places: ${error.message}`);
  }

  return data;
};

// 해시태그(카테고리/태그) 기반 검색: #카페 한강 → 카테고리에 '카페' 포함 AND 상호명 '한강' 포함
export const searchRestaurantsByTag = async (
  tag: string,
  nameKeyword?: string,
) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase.from('places').select('*');

    // 식당/카페 범위 제한
    query = query.in('category_group_code', ['FD6', 'CE7']);

    const trimmedTag = tag.trim();
    if (trimmedTag.length === 0) {
      return [];
    }

    // 카테고리명 또는 그룹명에 태그가 포함되는지 검색
    query = query.or(
      `category_name.ilike.%${trimmedTag}%,category_group_name.ilike.%${trimmedTag}%`,
    );

    const trimmedName = (nameKeyword ?? '').trim();
    if (trimmedName.length > 0) {
      query = query.ilike('place_name', `%${trimmedName}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data ?? [];
  } catch (error) {
    console.error('Error in searchRestaurantsByTag:', error);
    return [];
  }
};
