import 'react-native-get-random-values'; // 👈 Obligatoire ici aussi
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const saveActivitiesToMood = async (moodEntryId, activities = []) => {
  const activityRows = activities.map((a) => ({
    id: uuidv4(),
    mood_entry_id: moodEntryId,
    activity_name: a.name,
  }));

  const { error } = await supabase
    .from('mood_activities')
    .insert(activityRows);

  if (error) throw error;
};