onRecordAfterCreateSuccess((e) => {
  const appt = e.record
  const notifications = $app.findCollectionByNameOrId('notifications')

  const n1 = new Record(notifications)
  n1.set('recipient', appt.get('patient'))
  n1.set('message', 'Sua sessão foi agendada.')
  n1.set('read', false)
  $app.save(n1)

  const n2 = new Record(notifications)
  n2.set('recipient', appt.get('psychologist'))
  n2.set('message', 'Nova sessão agendada.')
  n2.set('read', false)
  $app.save(n2)

  e.next()
}, 'appointments')
