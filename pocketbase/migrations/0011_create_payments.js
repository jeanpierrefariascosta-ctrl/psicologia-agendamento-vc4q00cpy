migrate(
  (app) => {
    const collection = new Collection({
      name: 'payments',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin')",
      viewRule:
        "@request.auth.id != '' && (patient = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin')",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'psychologist' || @request.auth.role = 'admin')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'psychologist' || @request.auth.role = 'admin')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'psychologist' || @request.auth.role = 'admin')",
      fields: [
        {
          name: 'patient',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'plan_name', type: 'text', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'due_date', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'paid', 'overdue'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('payments')
      app.delete(collection)
    } catch (_) {}
  },
)
