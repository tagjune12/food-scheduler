import { createClient } from '@supabase/supabase-js';
import { Database } from '@src/types/supabase';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);


export const getRestaurants = async () => {
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }else{
      console.log('supabase client initialized');
    }

    const { data, error} = await supabase.from('places').select('*').eq('category_group_code', 'FD6').order('place_name', { ascending: true });
     
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
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }else{
      console.log('supabase client initialized');
    }

    const { data, error} = await supabase.from('places').select('*').eq('category_group_code', 'FD6').in('place_name', names);
     
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

export const searchRestaurantwithName = async (keyword: string) => {
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }else{
      console.log('supabase client initialized');
    }

    const { data, error} = await supabase.from('places').select('*').eq('category_group_code', 'FD6').ilike('place_name', `%${keyword.trim()}%`);
     
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

export const getRestaurantsWithPagination = async (page: number, dataPerPage: number) => {
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }else{
      console.log('supabase client initialized');
    }

    const { data, error} = await supabase.from('places').select('*').eq('category_group_code', 'FD6').range(page * dataPerPage, (page + 1) * dataPerPage - 1);
     
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

// 방문일자 최신순으로 방문 기록 조회
// order: 'asc' or 'desc'
export const getHistory = async (userId: string, order: string) => {
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }else{
      console.log('supabase client initialized');
    }

    // const { data, error} = await supabase.from('history').select('*').eq('user_id', `${userId}`).order('visit_date', { ascending: order === 'asc' ? true : false});
    const page = 1; // 현재 페이지 (1부터 시작)
    const pageSize = 10; // 한 페이지에 몇 개씩 보여줄지
    
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
    .from('call_places_with_history')
    .select('*')
    // .eq('user_id', `${userId}`)
    .order('visit_date', { ascending: false })
    .range(from, to);
    
     
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

export const insertHistory = async (userId: string, placeName: string, visitDate: string, eventId: string, dayNight?: string) => {
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }else{
      console.log('supabase client initialized');
    }

    const { data, error} = await supabase.from('history').upsert({
      user_id: userId,
      event_id: eventId,
      place_name: placeName,
      visit_date: visitDate,
      day_night: dayNight
    },{onConflict: 'event_id,user_id'}).select();
  
     
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in insertHistory:', error);
    return [];
  }
}

// export const updateHistory = async (userId: string, placeName: string, visitDate: string, eventId: string, dayNight?: string) => {
//   try{
//     if (!supabase) {
//       throw new Error('Supabase client not initialized');
//     }else{
//       console.log('supabase client initialized');
//     }

//     const { data, error} = await supabase.from('history').update({
//       place_name: placeName,
//       visit_date: visitDate,
//       day_night: dayNight
//     }).eq('user_id', userId).eq('event_id', eventId).select();
    
     
//     if (error) {
//       console.error('Supabase error:', error);
//       throw error;
//     }
//     return data;
//   } catch (error) {
//     console.error('Error in getRestaurants:', error);
//     return [];
//   }
// }


export const insertBookmark = async (userId: string, placeId: string) => {
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }else{
      console.log('supabase client initialized');
    }

    const { data, error} = await supabase.from('bookmarks').upsert({
      user_id: userId,
      id: placeId,
    },{onConflict: 'user_id,id'}).select();
  
     
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in insertBookmark:', error);
    return [];
  }
}

export const getBookmarks = async (userId: string) => {
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
      }else{
      console.log('supabase client initialized');
    }

    const { data, error} = await supabase.from('call_bookmarks_with_places').select('id,address_name,category_group_code,category_group_name,category_name,latitude,longitude,phone,place_name,place_url,road_address_name').eq('user_id', userId);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getBookmarks:', error);
    return [];
  }
}

export const deleteBookmark = async (userId: string, placeId: string) => {
  try{
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }else{
      console.log('supabase client initialized');
    }

    const { data, error} = await supabase.from('bookmarks').delete().eq('user_id', userId).eq('id', placeId).select();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in deleteBookmark:', error);
    return [];  
  }
}


export const getPlacesWithUserBookmarks = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('get_places_with_bookmarks', { 
      p_user_id: userId 
    });
  
  if (error) {
    throw new Error(`Failed to fetch places: ${error.message}`);
  }
  
  return data;
}

export const getPlacesWithNameAndBookmarks = async (userId: string, names: string[]) => {
  const { data, error } = await supabase
    .rpc('get_places_with_name_and_bookmarks', { 
      p_place_names: names,
      p_user_id: userId,
    });
  
  if (error) {
    throw new Error(`Failed to fetch places: ${error.message}`);
  }
  
  return data;
}

// export const getBookmarkedPlaces = async (userId: string) => {
//   const { data, error } = await supabase
//     .rpc('get_bookmarked_places', { 
//       p_user_id: userId 
//     });
  
//   if (error) {
//     throw new Error(`Failed to fetch places: ${error.message}`);
//   }
  
//   return data;
// }

// // 사용
// try {
//   const places = await getPlacesWithUserBookmarks('user123');
//   console.log(places);
// } catch (error) {
//   console.error(error);
// }