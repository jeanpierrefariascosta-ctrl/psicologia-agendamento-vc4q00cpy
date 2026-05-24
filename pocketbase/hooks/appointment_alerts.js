onRecordCreateRequest((e) => {
  e.next()
  const record = e.record
  const notifs = $app.findCollectionByNameOrId('notifications')
  const n = new Record(notifs)
  n.set('recipient', record.get('psychologist'))
  n.set('message', 'Novo agendamento recebido.')
  $app.saveNoValidate(n)

  if (e.auth && e.auth.id === record.get('psychologist')) {
    const np = new Record(notifs)
    np.set('recipient', record.get('patient'))
    np.set('message', 'Um novo agendamento foi marcado para você.')
    $app.saveNoValidate(np)
  }
}, 'appointments')

onRecordUpdateRequest((e) => {
  const origStatus = e.record.original().getString('status')
  const origStart = e.record.original().getString('start_time')
  e.next()
  const record = e.record
  const newStatus = record.getString('status')
  const newStart = record.getString('start_time')

  const authId = e.auth?.id
  const patientId = record.get('patient')
  const psychId = record.get('psychologist')

  if (origStatus !== newStatus && newStatus === 'cancelled') {
    const recipient = authId === patientId ? psychId : patientId
    const msg =
      authId === patientId ? 'Um paciente cancelou a sessão.' : 'Sua sessão foi cancelada.'

    const notifs = $app.findCollectionByNameOrId('notifications')
    const n = new Record(notifs)
    n.set('recipient', recipient)
    n.set('message', msg)
    $app.saveNoValidate(n)
  } else if (origStart !== newStart) {
    const recipient = authId === patientId ? psychId : patientId
    const msg =
      authId === patientId ? 'O paciente reagendou a sessão.' : 'Sua sessão foi reagendada.'

    const notifs = $app.findCollectionByNameOrId('notifications')
    const n = new Record(notifs)
    n.set('recipient', recipient)
    n.set('message', msg)
    $app.saveNoValidate(n)
  }
}, 'appointments')
