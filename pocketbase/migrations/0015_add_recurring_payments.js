migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('first_login')) {
      users.fields.add(new BoolField({ name: 'first_login' }))
      app.save(users)
    }

    // Set existing users to false so they don't get locked out
    app
      .db()
      .newQuery("UPDATE users SET first_login = 0 WHERE first_login IS NULL OR first_login = ''")
      .execute()

    const recurring = new Collection({
      name: 'recurring_payments',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (psychologist = @request.auth.id || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (psychologist = @request.auth.id || @request.auth.role = 'admin')",
      createRule:
        "@request.auth.id != '' && (psychologist = @request.auth.id || @request.auth.role = 'admin')",
      updateRule:
        "@request.auth.id != '' && (psychologist = @request.auth.id || @request.auth.role = 'admin')",
      deleteRule:
        "@request.auth.id != '' && (psychologist = @request.auth.id || @request.auth.role = 'admin')",
      fields: [
        {
          name: 'patient',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        {
          name: 'psychologist',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'plan_name', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true },
        {
          name: 'frequency',
          type: 'select',
          required: true,
          values: ['weekly', 'bi_weekly', 'monthly'],
          maxSelect: 1,
        },
        { name: 'next_billing_date', type: 'date', required: true },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(recurring)
  },
  (app) => {
    try {
      const recurring = app.findCollectionByNameOrId('recurring_payments')
      app.delete(recurring)
    } catch (_) {}

    try {
      const users = app.findCollectionByNameOrId('_pb_users_auth_')
      users.fields.removeByName('first_login')
      app.save(users)
    } catch (_) {}
  },
)
