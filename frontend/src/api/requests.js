import client from './client'

export const getRequests = (listingId) =>
  client.get(`/listings/${listingId}/requests`).then(r => r.data)

export const sendRequest = (listingId, data) =>
  client.post(`/listings/${listingId}/requests`, data).then(r => r.data)

export const acceptRequest = (requestId) =>
  client.patch(`/requests/${requestId}/accept`).then(r => r.data)

export const rejectRequest = (requestId) =>
  client.patch(`/requests/${requestId}/reject`).then(r => r.data)

export const cancelRequest = (requestId) =>
  client.patch(`/requests/${requestId}/cancel`).then(r => r.data)
