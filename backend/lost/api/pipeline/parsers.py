from flask_restx import reqparse

get_pipelines_parser = reqparse.RequestParser()
get_pipelines_parser.add_argument(
    'pageSize',
    type=int, 
    help='Page Size',
    location='args',
    dest='page_size'
)
get_pipelines_parser.add_argument(
    'page',
    type=int, 
    help='Loaded Page',
    location='args',
    dest='page'
)
get_pipelines_parser.add_argument(
    'filteredName',
    type=str, 
    help='Name to filter for',
    location='args',
    dest='filtered_name'
)
get_pipelines_parser.add_argument(
    'filteredStates',
    type=str, 
    help='List of filtered States seperated by ","',
    location='args',
    dest='filtered_states'
)