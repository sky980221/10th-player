import client from './client'

export const getMyTickets = () => client.get('/tickets/me').then(r => r.data)
export const registerTicket = (data) => client.post('/tickets', data).then(r => r.data)
