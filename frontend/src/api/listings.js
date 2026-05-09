import client from './client'

export const getListings = (gameDate) =>
  client.get('/listings', { params: { gameDate } }).then(r => r.data)

export const createListing = (data) =>
  client.post('/listings', data).then(r => r.data)

export const cancelListing = (listingId) =>
  client.delete(`/listings/${listingId}`).then(r => r.data)
