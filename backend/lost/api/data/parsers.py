from flask_restx import reqparse

get_image_parser = reqparse.RequestParser()
get_image_parser.add_argument(
    'type',
    type=str, 
    help='Type of the mia image to get, currently there are: "imageBased" and "annoBased"',
    location='args',
    dest='type'
)
get_image_parser.add_argument(
    'context',
    type=float, 
    help='Context Size',
    location='args',
    dest='context'
)
get_image_parser.add_argument(
    'drawAnno',
    type=bool, 
    help='Wheather anno should be drawn',
    location='args',
    dest='draw_anno'
)
