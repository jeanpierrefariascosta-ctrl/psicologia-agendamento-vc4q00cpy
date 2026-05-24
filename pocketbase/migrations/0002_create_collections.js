migrate(
  (app) => {
    const appointments = new Collection({
      name: 'appointments',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (patient = @request.auth.id || psychologist = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (patient = @request.auth.id || psychologist = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (patient = @request.auth.id || psychologist = @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (patient = @request.auth.id || psychologist = @request.auth.id)",
      fields: [
        {
          name: 'patient',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        {
          name: 'psychologist',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        { name: 'start_time', type: 'date', required: true },
        { name: 'end_time', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['scheduled', 'cancelled', 'completed', 'no_show'],
          required: true,
        },
        { name: 'cancel_reason', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(appointments)

    const availability = new Collection({
      name: 'availability',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && psychologist = @request.auth.id",
      updateRule: "@request.auth.id != '' && psychologist = @request.auth.id",
      deleteRule: "@request.auth.id != '' && psychologist = @request.auth.id",
      fields: [
        {
          name: 'psychologist',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        { name: 'day_of_week', type: 'number', required: true, min: 0, max: 6 },
        { name: 'start_time', type: 'text', required: true },
        { name: 'end_time', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(availability)

    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: "@request.auth.id != '' && recipient = @request.auth.id",
      viewRule: "@request.auth.id != '' && recipient = @request.auth.id",
      createRule: null,
      updateRule: "@request.auth.id != '' && recipient = @request.auth.id",
      deleteRule: "@request.auth.id != '' && recipient = @request.auth.id",
      fields: [
        {
          name: 'recipient',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
        },
        { name: 'message', type: 'text', required: true },
        { name: 'read', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(notifications)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('appointments'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('availability'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('notifications'))
    } catch (_) {}
  },
)
