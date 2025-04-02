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
