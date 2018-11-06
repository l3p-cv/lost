from flask_restplus import reqparse

sia_update_parser = reqparse.RequestParser()
sia_update_parser.add_argument('data',
                           type=str,
                           required=True,
                           help="Name of group.")
