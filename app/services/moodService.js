import { supabase } from '../lib/supabase';

export const saveMood = async (mood) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('mood_entries')
    .insert({ 
      patient_id: userId, 
      mood: mood.name
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getLastMoodEntry = async () => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('mood_entries')
    .select(`
      id,
      mood,
      created_at,
      mood_activities (
        id,
        activity_name
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

export const getMoodHistory = async () => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const { data: moodEntries, error: moodError } = await supabase
    .from('mood_entries')
    .select(`
      id,
      mood,
      created_at,
      mood_activities (
        id,
        activity_name
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false });

  if (moodError) throw moodError;

  return moodEntries.map(entry => {
    // Find the corresponding mood from our predefined MOODS array
    const moodInfo = MOODS.find(m => m.name === entry.mood) || MOODS[2]; // Default to "Okay" if not found
    
    return {
      id: entry.id,
      mood: entry.mood,
      scale: moodInfo.scale,
      color: moodInfo.color,
      date: new Date(entry.created_at).toLocaleDateString(),
      time: new Date(entry.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      activities: entry.mood_activities.map(activity => {
        const activityInfo = ACTIVITIES.find(a => a.name === activity.activity_name);
        return {
          ...activity,
          icon: activityInfo?.icon,
          color: activityInfo?.color
        };
      })
    };
  });
};

export const getMoodStats = async () => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  const { data: moodEntries, error } = await supabase
    .from('mood_entries')
    .select(`
      scale,
      created_at,
      mood_activities (
        activity_name
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })
    .limit(30); // Last 30 entries for analysis

  if (error) throw error;

  // Calculate average mood scale
  const avgMoodScale = moodEntries.reduce((sum, entry) => sum + entry.scale, 0) / moodEntries.length;

  // Analyze activity impact
  const activityImpact = {};
  moodEntries.forEach(entry => {
    entry.mood_activities.forEach(activity => {
      if (!activityImpact[activity.activity_name]) {
        activityImpact[activity.activity_name] = {
          count: 0,
          totalScale: 0,
          avgScale: 0
        };
      }
      activityImpact[activity.activity_name].count++;
      activityImpact[activity.activity_name].totalScale += entry.scale;
    });
  });

  // Calculate average mood scale for each activity
  Object.keys(activityImpact).forEach(activity => {
    activityImpact[activity].avgScale = 
      activityImpact[activity].totalScale / activityImpact[activity].count;
  });

  return {
    averageMoodScale: avgMoodScale,
    activityImpact,
    totalEntries: moodEntries.length
  };
};