import client from './client'

export const getListings = (gameDate, stadium) =>
  client.get('/listings', { params: { gameDate, stadium } }).then(r => r.data)

export const getMyListings = () =>
  client.get('/listings/mine').then(r => r.data)

export const createListing = (data) =>
  client.post('/listings', data).then(r => r.data)

export const cancelListing = (listingId) =>
  client.delete(`/listings/${listingId}`).then(r => r.data)
