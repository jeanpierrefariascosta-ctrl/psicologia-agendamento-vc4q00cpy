migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['patient', 'psychologist', 'admin'],
          maxSelect: 1,
        }),
      )
    }
    if (!users.fields.getByName('bio')) {
      users.fields.add(new TextField({ name: 'bio' }))
    }
    if (!users.fields.getByName('specialties')) {
      users.fields.add(new JSONField({ name: 'specialties' }))
    }
    app.save(users)

    try {
      app.findCollectionByNameOrId('appointments')
    } catch (_) {
      const appointments = new Collection({
        name: 'appointments',
        type: 'base',
        listRule:
          "@request.auth.id != '' && (patient = @request.auth.id || psychologist = @request.auth.id || @request.auth.role = 'admin')",
        viewRule:
          "@request.auth.id != '' && (patient = @request.auth.id || psychologist = @request.auth.id || @request.auth.role = 'admin')",
        createRule: "@request.auth.id != ''",
        updateRule:
          "@request.auth.id != '' && (patient = @request.auth.id || psychologist = @request.auth.id || @request.auth.role = 'admin')",
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
          { name: 'start_time', type: 'date', required: true },
          { name: 'end_time', type: 'date', required: true },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['scheduled', 'cancelled', 'completed', 'no_show'],
            maxSelect: 1,
          },
          { name: 'cancel_reason', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(appointments)
    }

    try {
      app.findCollectionByNameOrId('availability')
    } catch (_) {
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
            required: true,
            collectionId: '_pb_users_auth_',
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
    }

    try {
      app.findCollectionByNameOrId('notifications')
    } catch (_) {
      const notifications = new Collection({
        name: 'notifications',
        type: 'base',
        listRule: "@request.auth.id != '' && recipient = @request.auth.id",
        viewRule: "@request.auth.id != '' && recipient = @request.auth.id",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != '' && recipient = @request.auth.id",
        deleteRule: "@request.auth.id != '' && recipient = @request.auth.id",
        fields: [
          {
            name: 'recipient',
            type: 'relation',
            required: true,
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          { name: 'message', type: 'text', required: true },
          { name: 'read', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
      })
      app.save(notifications)
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notifications'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('availability'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('appointments'))
    } catch (_) {}
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role')
    users.fields.removeByName('bio')
    users.fields.removeByName('specialties')
    app.save(users)
  },
)
