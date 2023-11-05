from flask_restx import Api

# authorization documentation for swagger ui
authorizations = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization'
    }
}

api = Api(version='0.1', title='LOST API', description='REST and LOST specific services.', authorizations=authorizations)

@api.errorhandler
def std_handler(e):
    return {'message': 'An unexpected error has occured.'}, 500