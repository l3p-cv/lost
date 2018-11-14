from flask_restplus import reqparse

login_parser = reqparse.RequestParser()
login_parser.add_argument('user_name',
                           type=str,
                           required=True,
                           help="Username.")
login_parser.add_argument('password',
                           type=str,
                           required=True,
                           help="Password.")

create_user_parser = reqparse.RequestParser()
create_user_parser.add_argument('user_name',
                           type=str,
                           required=True,
                           help="E-Mail.")
create_user_parser.add_argument('password',
                           type=str,
                           required=True,
                           help="Password.")
create_user_parser.add_argument('groups',
                           action='append',
                           help="List of groups.")
create_user_parser.add_argument('roles',
                           action='append',
                           help="List of roles.")

                        