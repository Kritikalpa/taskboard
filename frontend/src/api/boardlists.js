import client from './client';

export const createList  = (boardId, data) => client.post(`/boards/${boardId}/lists`, data);
export const getList     = (id)            => client.get(`/board-lists/${id}`);
export const updateList  = (id, data)      => client.put(`/board-lists/${id}`, data);
export const deleteList  = (id)            => client.delete(`/board-lists/${id}`);
