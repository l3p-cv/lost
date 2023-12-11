from wtforms import Form, IntegerField, StringField, validators

class CreateDatasetForm(Form):
    name = StringField('Name', [validators.Length(min=1, max=254)])
    description = StringField('Description', [validators.Length(min=1, max=254)])
    parentDatasetId = IntegerField('Parent', [validators.NumberRange(min=-1)])
    # datastoreId = IntegerField('DatastoreId', [validators.NumberRange(min=0)])

class UpdateDatasetForm(CreateDatasetForm):
    id = IntegerField('Index', [validators.NumberRange(min=0)])
    
class DatasetReviewForm(Form):
    direction = StringField('Direction', [validators.Length(min=1, max=254)])

def create_validation_error_message(form):
        """Creates a error message string out of a failed wtform
        """
        error_fields = form.errors.items()
        error_msgs = ""
        
        # go through all errors from all fields
        for field in error_fields:
            errors = field[1]
            for error in errors:
                # combine all errors into a single string
                error_msg = f'Error in field {field[0]}: {error}'
                error_msgs = error_msgs + error_msg

        return error_msgs