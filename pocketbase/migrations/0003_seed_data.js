migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let psych
    try {
      psych = app.findAuthRecordByEmail('_pb_users_auth_', 'jpierre_costa@hotmail.com')
    } catch (_) {
      psych = new Record(users)
      psych.setEmail('jpierre_costa@hotmail.com')
      psych.setPassword('Skip@Pass')
      psych.setVerified(true)
      psych.set('name', 'Dra. Silva')
      psych.set('role', 'psychologist')
      app.save(psych)
    }

    let patient
    try {
      patient = app.findAuthRecordByEmail('_pb_users_auth_', 'patient_demo@example.com')
    } catch (_) {
      patient = new Record(users)
      patient.setEmail('patient_demo@example.com')
      patient.setPassword('Skip@Pass')
      patient.setVerified(true)
      patient.set('name', 'Paciente Demo')
      patient.set('role', 'patient')
      app.save(patient)
    }

    const availCol = app.findCollectionByNameOrId('availability')
    for (let i = 1; i <= 5; i++) {
      try {
        app.findFirstRecordByFilter(
          'availability',
          `psychologist='${psych.id}' && day_of_week=${i}`,
        )
      } catch (_) {
        const avail = new Record(availCol)
        avail.set('psychologist', psych.id)
        avail.set('day_of_week', i)
        avail.set('start_time', '09:00')
        avail.set('end_time', '17:00')
        app.save(avail)
      }
    }
  },
  (app) => {},
)
