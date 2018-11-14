from flask_restplus import reqparse

group_parser = reqparse.RequestParser()
group_parser.add_argument('group_name',
                           type=str,
                           required=True,
                           help="Name of group.")
