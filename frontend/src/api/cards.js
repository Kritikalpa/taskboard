import client from './client';

export const createCard    = (listId, data) => client.post(`/board-lists/${listId}/cards`, data);
export const getCard       = (id)           => client.get(`/cards/${id}`);
export const updateCard    = (id, data)     => client.put(`/cards/${id}`, data);
export const deleteCard    = (id)           => client.delete(`/cards/${id}`);
export const assignCard    = (id, data)     => client.patch(`/cards/${id}/assign`, data);
export const unassignCard  = (id, userId)   => client.patch(`/cards/${id}/unassign`, { user_id: userId });
export const moveCard      = (id, data)     => client.patch(`/cards/${id}/move`, data);
