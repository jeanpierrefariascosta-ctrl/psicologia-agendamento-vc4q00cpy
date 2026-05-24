onRecordAfterUpdateSuccess((e) => {
  const appt = e.record
  const oldStatus = appt.original().getString('status')
  const newStatus = appt.getString('status')

  if (oldStatus !== newStatus) {
    const notifications = $app.findCollectionByNameOrId('notifications')

    let msg = `O status da sua sessão mudou para: ${newStatus}`
    if (newStatus === 'cancelled') {
      msg = 'Sua sessão foi cancelada.'
    }

    const n1 = new Record(notifications)
    n1.set('recipient', appt.get('patient'))
    n1.set('message', msg)
    n1.set('read', false)
    $app.save(n1)

    const n2 = new Record(notifications)
    n2.set('recipient', appt.get('psychologist'))
    n2.set('message', msg)
    n2.set('read', false)
    $app.save(n2)
  }

  e.next()
}, 'appointments')
