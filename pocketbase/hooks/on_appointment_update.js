onRecordUpdateRequest((e) => {
  e.next()
  try {
    const status = e.record.getString('status')
    const originalStatus = e.record.original().getString('status')

    if (status !== originalStatus) {
      const notifs = $app.findCollectionByNameOrId('notifications')
      const patientId = e.record.getString('patient')
      const psychId = e.record.getString('psychologist')
      const creatorId = e.auth?.id
      const targetId = creatorId === patientId ? psychId : patientId

      if (targetId) {
        const notif = new Record(notifs)
        notif.set('recipient', targetId)
        let msg = 'Atualização no seu agendamento.'
        if (status === 'cancelled') msg = 'Um agendamento foi cancelado.'
        if (status === 'completed') msg = 'Uma sessão foi marcada como concluída.'
        notif.set('message', msg)
        $app.save(notif)
      }
    }
  } catch (err) {
    $app.logger().error('Notification update failed', 'error', err.message)
  }
}, 'appointments')
