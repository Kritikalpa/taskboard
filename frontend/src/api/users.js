import client from './client';

export const getAllUsers  = ()      => client.get('/users');
export const getUser      = (id)    => client.get(`/users/${id}`);
export const createUser   = (data)  => client.post('/users', data);
