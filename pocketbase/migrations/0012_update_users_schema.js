migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('phone')) {
      users.fields.add(new TextField({ name: 'phone' }))
    }
    if (!users.fields.getByName('anamnesis')) {
      users.fields.add(new TextField({ name: 'anamnesis' }))
    }
    if (!users.fields.getByName('documents')) {
      users.fields.add(
        new FileField({
          name: 'documents',
          maxSelect: 10,
          maxSize: 52428800,
        }),
      )
    }

    users.listRule =
      "id = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin'"
    users.viewRule =
      "id = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin'"
    users.updateRule =
      "id = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin'"

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('phone')
    users.fields.removeByName('anamnesis')
    users.fields.removeByName('documents')

    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'

    app.save(users)
  },
)
