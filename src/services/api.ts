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

export const getPsychologistAvailability = async (psychId: string) => {
  return pb.collection('availability').getFullList({
    filter: `psychologist="${psychId}"`,
  })
}

export const getPsychologistAppointments = async (psychId: string) => {
  const now = new Date().toISOString()
  return pb.collection('appointments').getFullList({
    filter: `psychologist="${psychId}" && start_time >= "${now}" && status != "cancelled"`,
  })
}

export const getPatients = async () => {
  return pb.collection('users').getFullList({
    filter: `role="patient"`,
  })
}

export const createPatient = async (data: any) => {
  if (data instanceof FormData) {
    return pb.collection('users').create(data)
  }
  return pb.collection('users').create({
    ...data,
    role: 'patient',
    passwordConfirm: data.password,
  })
}

export const updatePatient = async (id: string, data: any) => {
  return pb.collection('users').update(id, data)
}

export const getPayments = async () => {
  return pb.collection('payments').getFullList({
    expand: 'patient',
    sort: '-due_date',
  })
}

export const createPayment = async (data: Partial<any>) => {
  return pb.collection('payments').create(data)
}

export const updatePayment = async (id: string, data: Partial<any>) => {
  return pb.collection('payments').update(id, data)
}

export const getRecurringPayments = async (psychologistId: string) => {
  return pb.collection('recurring_payments').getFullList({
    filter: `psychologist="${psychologistId}"`,
    expand: 'patient',
    sort: '-created',
  })
}

export const createRecurringPayment = async (data: Partial<any>) => {
  return pb.collection('recurring_payments').create(data)
}
