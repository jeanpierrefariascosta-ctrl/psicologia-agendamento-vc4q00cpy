migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(
      new SelectField({ name: 'role', values: ['patient', 'psychologist', 'admin'], maxSelect: 1 }),
    )
    users.fields.add(new TextField({ name: 'bio' }))
    users.fields.add(new JSONField({ name: 'specialties' }))
    app.save(users)

    const appointments = new Collection({
      name: 'appointments',
      type: 'base',
      listRule:
        "@request.auth.id = patient || @request.auth.id = psychologist || @request.auth.role = 'admin'",
      viewRule:
        "@request.auth.id = patient || @request.auth.id = psychologist || @request.auth.role = 'admin'",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id = patient || @request.auth.id = psychologist || @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id = psychologist || @request.auth.role = 'admin'",
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

    const availability = new Collection({
      name: 'availability',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '@request.auth.id = psychologist',
      updateRule: '@request.auth.id = psychologist',
      deleteRule: '@request.auth.id = psychologist',
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

    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: '@request.auth.id = recipient',
      viewRule: '@request.auth.id = recipient',
      createRule: "@request.auth.id != ''",
      updateRule: '@request.auth.id = recipient',
      deleteRule: '@request.auth.id = recipient',
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
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('notifications'))
    app.delete(app.findCollectionByNameOrId('availability'))
    app.delete(app.findCollectionByNameOrId('appointments'))
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role')
    users.fields.removeByName('bio')
    users.fields.removeByName('specialties')
    app.save(users)
  },
)
