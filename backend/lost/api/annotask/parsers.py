from flask_restx import reqparse

annotask_parser = reqparse.RequestParser()
annotask_parser.add_argument('id',
                           type=int,
                           required=True,
                           help="Id of the annotask.")
