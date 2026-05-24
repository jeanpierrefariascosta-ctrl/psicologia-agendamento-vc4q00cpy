onRecordCreateRequest((e) => {
  e.next()
  try {
    const notifs = $app.findCollectionByNameOrId('notifications')
    const patientId = e.record.getString('patient')
    const psychId = e.record.getString('psychologist')
    const creatorId = e.auth?.id
    const targetId = creatorId === patientId ? psychId : patientId

    if (targetId) {
      const notif = new Record(notifs)
      notif.set('recipient', targetId)
      notif.set('message', 'Novo agendamento confirmado.')
      $app.save(notif)
    }
  } catch (err) {
    $app.logger().error('Notification creation failed', 'error', err.message)
  }
}, 'appointments')
