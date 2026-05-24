cronAdd('process_recurring_payments', '0 0 * * *', () => {
  const nowStr = new Date().toISOString().replace('T', ' ')

  const records = $app.findRecordsByFilter(
    'recurring_payments',
    'active = true && next_billing_date <= {:now}',
    '',
    1000,
    0,
    { now: nowStr },
  )

  const paymentsCol = $app.findCollectionByNameOrId('payments')

  $app.runInTransaction((txApp) => {
    for (const rec of records) {
      const payment = new Record(paymentsCol)
      payment.set('patient', rec.get('patient'))
      payment.set('plan_name', rec.get('plan_name'))
      payment.set('amount', rec.get('amount'))
      payment.set('due_date', rec.get('next_billing_date'))
      payment.set('status', 'pending')
      txApp.save(payment)

      const freq = rec.getString('frequency')
      let nextDate = new Date(rec.getString('next_billing_date'))
      if (isNaN(nextDate.getTime())) {
        nextDate = new Date()
      }
      if (freq === 'weekly') nextDate.setDate(nextDate.getDate() + 7)
      else if (freq === 'bi_weekly') nextDate.setDate(nextDate.getDate() + 14)
      else if (freq === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1)

      rec.set('next_billing_date', nextDate.toISOString().replace('T', ' '))
      txApp.save(rec)
    }
  })
})
