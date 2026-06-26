import client from './client';

export const getAllBoards   = ()          => client.get('/boards');
export const getBoard       = (id)        => client.get(`/boards/${id}`);
export const createBoard    = (data)      => client.post('/boards', data);
export const updateBoard    = (id, data)  => client.put(`/boards/${id}`, data);
export const deleteBoard    = (id)        => client.delete(`/boards/${id}`);
export const addMember      = (id, data)  => client.post(`/boards/${id}/members`, data);
export const removeMember   = (id, uid)   => client.delete(`/boards/${id}/members/${uid}`);
