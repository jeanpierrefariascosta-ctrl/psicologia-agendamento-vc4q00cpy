migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          maxSelect: 1,
          values: ['patient', 'psychologist', 'admin'],
          required: false,
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
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role')
    users.fields.removeByName('bio')
    users.fields.removeByName('specialties')
    app.save(users)
  },
)
