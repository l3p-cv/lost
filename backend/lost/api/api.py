from flask_restx import Api

api = Api(version='0.1', title='LOST API', description='REST and LOST specific services.')

@api.errorhandler
def std_handler(e):
    return {'message': 'An unexpected error has occured.'}, 500