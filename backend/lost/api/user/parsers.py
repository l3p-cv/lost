from flask_restplus import reqparse

login_parser = reqparse.RequestParser()
login_parser.add_argument('email',
                           type=str,
                           required=True,
                           help="E-Mail.")
login_parser.add_argument('password',
                           type=str,
                           required=True,
                           help="Password.")