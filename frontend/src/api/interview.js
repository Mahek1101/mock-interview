import API from './auth';

export const startSession    = (topic, difficulty = 'medium') => API.post('/interview/start', { topic, difficulty });
export const submitAnswer    = (data)       => API.post('/interview/answer', data);
export const nextQuestion    = (session_id, difficulty = 'medium') => API.post('/interview/next', { session_id, difficulty });
export const completeSession = (id)         => API.post(`/interview/complete/${id}`);
export const getHistory      = ()           => API.get('/interview/history');
