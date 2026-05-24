onRecordCreateRequest((e) => {
  e.next()
  const record = e.record
  const notifs = $app.findCollectionByNameOrId('notifications')
  const n = new Record(notifs)
  n.set('recipient', record.get('psychologist'))
  n.set('message', 'Novo agendamento recebido.')
  $app.saveNoValidate(n)
}, 'appointments')

onRecordUpdateRequest((e) => {
  const origStatus = e.record.original().getString('status')
  e.next()
  const record = e.record
  const newStatus = record.getString('status')

  if (origStatus !== newStatus && newStatus === 'cancelled') {
    const authId = e.auth?.id
    const patientId = record.get('patient')
    const psychId = record.get('psychologist')

    const recipient = authId === patientId ? psychId : patientId
    const msg =
      authId === patientId ? 'Um paciente cancelou a sessão.' : 'Sua sessão foi cancelada.'

    const notifs = $app.findCollectionByNameOrId('notifications')
    const n = new Record(notifs)
    n.set('recipient', recipient)
    n.set('message', msg)
    $app.saveNoValidate(n)
  }
}, 'appointments')
