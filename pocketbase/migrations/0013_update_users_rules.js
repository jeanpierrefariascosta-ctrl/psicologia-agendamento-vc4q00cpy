migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.listRule =
      "id = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin' || (@request.auth.role = 'patient' && role = 'psychologist')"
    users.viewRule =
      "id = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin' || (@request.auth.role = 'patient' && role = 'psychologist')"
    users.createRule = "@request.auth.role = 'psychologist' || @request.auth.role = 'admin'"

    const docField = users.fields.getByName('documents')
    if (docField) {
      docField.maxSelect = 10
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    users.listRule =
      "id = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin'"
    users.viewRule =
      "id = @request.auth.id || @request.auth.role = 'psychologist' || @request.auth.role = 'admin'"
    users.createRule = ''

    const docField = users.fields.getByName('documents')
    if (docField) {
      docField.maxSelect = 1
    }

    app.save(users)
  },
)
