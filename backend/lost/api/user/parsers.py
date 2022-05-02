from flask_restx import reqparse

login_parser = reqparse.RequestParser()
login_parser.add_argument('userName',
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
create_user_parser.add_argument('email',
                           type=str,
                           required=True,
                           help="Email.")
create_user_parser.add_argument('groups',
                           action='append',
                           help="List of groups.")
create_user_parser.add_argument('roles',
                           action='append',
                           help="List of roles.")

update_user_parser = reqparse.RequestParser()
update_user_parser.add_argument('idx',
                           type=str,
                           help="User id.")
update_user_parser.add_argument('email',
                           type=str,
                           required=True,
                           help="E-Mail.")

update_user_parser.add_argument('first_name',
                           type=str,
                           required=True,
                           help="First Name.")

update_user_parser.add_argument('last_name',
                           type=str,
                           required=True,
                           help="Last Name.")

update_user_parser.add_argument('password',
                           type=str,
                           help="Password.")

update_user_parser.add_argument('groups',
                           action='append',
                           help="List of groups.")

update_user_parser.add_argument('roles',
                           action='append',
                           help="List of roles.")

                        