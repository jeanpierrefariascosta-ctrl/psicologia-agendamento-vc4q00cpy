onRecordUpdateRequest((e) => {
  const origStatus = e.record.original().getString('status')
  const newStatus = e.record.getString('status')

  if (origStatus === 'scheduled' && newStatus === 'cancelled') {
    const startTimeStr = e.record.getString('start_time')
    if (startTimeStr) {
      const startTime = new Date(startTimeStr).getTime()
      const now = new Date().getTime()
      const diffHours = (startTime - now) / (1000 * 60 * 60)

      if (diffHours < 24 && e.auth?.getString('role') === 'patient') {
        throw new BadRequestError(
          'Cancelamentos só são permitidos com pelo menos 24 horas de antecedência.',
        )
      }
    }
  }

  e.next()
}, 'appointments')
