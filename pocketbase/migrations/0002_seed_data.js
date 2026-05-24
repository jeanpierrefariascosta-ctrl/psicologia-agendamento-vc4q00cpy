migrate((app) => {
  const users = app.findCollectionByNameOrId('_pb_users_auth_')

  let psych, patient

  try {
    psych = app.findAuthRecordByEmail('_pb_users_auth_', 'jpierre_costa@hotmail.com')
  } catch (_) {
    psych = new Record(users)
    psych.setEmail('jpierre_costa@hotmail.com')
    psych.setPassword('Skip@Pass')
    psych.setVerified(true)
    psych.set('name', 'Dra. Silva')
    psych.set('role', 'psychologist')
    psych.set('bio', 'Especialista em TCC e Terapia Sistêmica.')
    app.save(psych)
  }

  try {
    patient = app.findAuthRecordByEmail('_pb_users_auth_', 'patient_demo@example.com')
  } catch (_) {
    patient = new Record(users)
    patient.setEmail('patient_demo@example.com')
    patient.setPassword('Skip@Pass')
    patient.setVerified(true)
    patient.set('name', 'João Paciente')
    patient.set('role', 'patient')
    app.save(patient)
  }

  const appts = app.findCollectionByNameOrId('appointments')
  if (app.countRecords('appointments') === 0) {
    const a1 = new Record(appts)
    a1.set('patient', patient.id)
    a1.set('psychologist', psych.id)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    const end = new Date(tomorrow)
    end.setHours(11, 0, 0, 0)

    a1.set('start_time', tomorrow.toISOString())
    a1.set('end_time', end.toISOString())
    a1.set('status', 'scheduled')
    app.save(a1)
  }
})
