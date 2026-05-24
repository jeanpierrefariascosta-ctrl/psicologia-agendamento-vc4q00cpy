import pb from '@/lib/pocketbase/client'

export const getAppointments = async () => {
  return pb.collection('appointments').getFullList({
    expand: 'patient,psychologist',
    sort: 'start_time',
  })
}

export const createAppointment = async (data: Partial<any>) => {
  return pb.collection('appointments').create(data)
}

export const updateAppointment = async (id: string, data: Partial<any>) => {
  return pb.collection('appointments').update(id, data)
}

export const cancelAppointment = async (id: string, appt: any, reason: string, userId?: string) => {
  return pb.collection('appointments').update(id, {
    status: 'cancelled',
    cancel_reason: reason,
  })
}

export const getNotifications = async (userId: string) => {
  return pb.collection('notifications').getFullList({
    filter: `recipient="${userId}"`,
    sort: '-created',
  })
}

export const markNotificationRead = async (id: string) => {
  return pb.collection('notifications').update(id, { read: true })
}

export const getPsychologists = async () => {
  return pb.collection('users').getFullList({
    filter: `role="psychologist"`,
  })
}
