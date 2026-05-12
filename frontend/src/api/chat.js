import client from './client'

export const getChatRooms = () =>
  client.get('/chat/rooms').then(r => r.data)

export const getMessages = (listingId) =>
  client.get(`/chat/${listingId}/messages`).then(r => r.data)

export const sendMessage = (listingId, content) =>
  client.post(`/chat/${listingId}/messages`, { content }).then(r => r.data)
