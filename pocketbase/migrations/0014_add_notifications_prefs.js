migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    if (!col.fields.getByName('notifications_enabled')) {
      col.fields.add(new BoolField({ name: 'notifications_enabled' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    if (col.fields.getByName('notifications_enabled')) {
      col.fields.removeByName('notifications_enabled')
      app.save(col)
    }
  },
)
