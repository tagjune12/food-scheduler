import { createClient } from '@supabase/supabase-js';
import { Database } from '@src/types/supabase';
import { HistoryType } from '@src/types';

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

    const { data, error} = await supabase.from('places').select('*').eq('category_group_code', 'FD6');
     
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
