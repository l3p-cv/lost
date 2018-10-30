from flask_restplus import reqparse

pagination_parser = reqparse.RequestParser()
pagination_parser.add_argument('page', type=int, required=False, default=1, help='Page number')
pagination_parser.add_argument('items_per_page', type=int, required=False, default=10, 
                                choices=[10,20,50], help='Items per page')

login_parser = reqparse.RequestParser()
login_parser.add_argument('email',
                           type=str,
                           required=True,
                           help="E-Mail.")
login_parser.add_argument('password',
                           type=str,
                           required=True,
                           help="Password.")