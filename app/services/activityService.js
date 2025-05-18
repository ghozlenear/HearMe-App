import { supabase } from '../lib/supabase';

export const saveActivitiesToMood = async (moodEntryId, activities = []) => {
  const activityRows = activities.map((activity) => ({
    mood_entry_id: moodEntryId,
    activity_name: activity.name
  }));

  const { error } = await supabase
    .from('mood_activities')
    .insert(activityRows);

  if (error) throw error;
};

export const getActivitiesForMood = async (moodEntryId) => {
  const { data, error } = await supabase
    .from('mood_activities')
    .select('*')
    .eq('mood_entry_id', moodEntryId);

  if (error) throw error;
  return data;
};

export const deleteActivitiesForMood = async (moodEntryId) => {
  const { error } = await supabase
    .from('mood_activities')
    .delete()
    .eq('mood_entry_id', moodEntryId);

  if (error) throw error;
};

export const getRecommendedActivities = async (currentMoodScale) => {
  const user = await supabase.auth.getUser();
  const userId = user.data.user?.id;
  if (!userId) throw new Error('User not authenticated');

  // Get recent mood entries with activities
  const { data: moodEntries, error } = await supabase
    .from('mood_entries')
    .select(`
      scale,
      mood_activities (
        activity_name
      )
    `)
    .eq('patient_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  // Analyze which activities helped improve mood
  const activityEffectiveness = {};
  
  moodEntries.forEach((entry, index) => {
    if (index === moodEntries.length - 1) return; // Skip last entry
    
    const currentScale = entry.scale;
    const nextEntry = moodEntries[index + 1];
    const scaleDiff = nextEntry.scale - currentScale;
    
    entry.mood_activities.forEach(activity => {
      if (!activityEffectiveness[activity.activity_name]) {
        activityEffectiveness[activity.activity_name] = {
          positiveImpact: 0,
          totalOccurrences: 0
        };
      }
      
      activityEffectiveness[activity.activity_name].totalOccurrences++;
      if (scaleDiff > 0) {
        activityEffectiveness[activity.activity_name].positiveImpact++;
      }
    });
  });

  // Find matching activities from our predefined list
  const recommendations = Object.entries(activityEffectiveness)
    .map(([name, stats]) => {
      const activityInfo = ACTIVITIES.find(a => a.name === name);
      if (!activityInfo) return null;

      return {
        name,
        icon: activityInfo.icon,
        color: activityInfo.color,
        effectivenessScore: (stats.positiveImpact / stats.totalOccurrences) * 100,
        totalOccurrences: stats.totalOccurrences
      };
    })
    .filter(activity => 
      activity && // Remove null entries
      activity.totalOccurrences >= 3 && 
      activity.effectivenessScore > 30
    )
    .sort((a, b) => b.effectivenessScore - a.effectivenessScore);

  return recommendations;
};