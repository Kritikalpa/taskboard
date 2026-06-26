import axios from 'axios';
import toast from 'react-hot-toast';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.error || 'Something went wrong';
    toast.error(msg, {
      style: {
        background: '#21262D',
        color: '#E6EDF3',
        border: '1px solid #30363D',
        borderRadius: '6px',
        fontSize: '13px',
      },
      iconTheme: { primary: '#F22F46', secondary: '#21262D' },
      duration: 3000,
    });
    return Promise.reject(err);
  }
);

export default client;
