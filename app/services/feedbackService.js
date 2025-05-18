import { supabase } from '../lib/supabase';

const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('feedbacks')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('Connection test failed:', error);
      throw new Error('Database connection failed');
    }
    console.log('Connection test successful');
    return true;
  } catch (err) {
    console.error('Connection test error:', err);
    throw new Error('Failed to connect to the database. Please check your internet connection.');
  }
};

export const submitFeedback = async (rating, message) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('feedbacks')
    .insert([
      {
        patient_id: user.id,
        message,
        rating,
      },
    ]);

  if (error) throw error;
};

export const fetchFeedbacks = async () => {
  try {
    await testConnection();

    console.log('Starting to fetch feedbacks...');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
        .from('feedbacks')
        .select(`
            id,
            message,
            rating,
            created_at,
            patient_id,
            patient (
            username
            )
  `     )
        .order('created_at', { ascending: false })
        .limit(50);


    if (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }

    if (!data) {
      console.error('No data returned from feedbacks query');
      throw new Error('No data received from database');
    }

    console.log('Feedback query successful:', { count: data.length });

    const mappedData = data.map(entry => ({
        id: entry.id,
        name: entry.patient?.username || 'Unknown User',
        text: entry.message,
        rating: entry.rating,
        isCurrentUser: entry.patient_id === user?.id,
        date: new Date(entry.created_at).toLocaleDateString(),
        time: new Date(entry.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
    }),
    }));


    return mappedData;
  } catch (err) {
    console.error('Error in fetchFeedbacks:', err);
    throw err;
  }
};


export const deleteFeedback = async (feedbackId) => {
  const { error } = await supabase
    .from('feedbacks')
    .delete()
    .eq('id', feedbackId);

  if (error) throw error;
};
