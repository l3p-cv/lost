from wtforms import Form, IntegerField, StringField, validators

class CreateDatasetForm(Form):
    name = StringField('Name', [validators.Length(min=1, max=254)])
    description = StringField('Description', [validators.Length(min=1, max=254)])
    datastoreId = IntegerField('DatastoreId', [validators.NumberRange(min=0)])

class UpdateDatasetForm(CreateDatasetForm):
    id = IntegerField('Index', [validators.NumberRange(min=0)])
    datastoreId = IntegerField('DatastoreId', [validators.NumberRange(min=0)])
    