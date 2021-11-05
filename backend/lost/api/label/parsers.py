from flask_restx import reqparse


update_label_parser = reqparse.RequestParser()
update_label_parser.add_argument('id',
                           type=int,
                           required=True,
                           help="Label Leaf id.")
update_label_parser.add_argument('name',
                           type=str,
                           required=True,
                           help="Label Leaf name")

update_label_parser.add_argument('description',
                           type=str,
                           required=True,
                           help="Label Leaf Description.")

update_label_parser.add_argument('abbreviation',
                           type=str,
                           required=True,
                           help="Label Leaf Abbreviaiton.")

update_label_parser.add_argument('external_id',
                           type=str,
                           help="External Label Leaf ID.")
update_label_parser.add_argument('color',
                           type=str,
                           help="Color of Label Leaf.")

create_label_parser = reqparse.RequestParser()
create_label_parser.add_argument('is_root',
                           type=bool,
                           required=True,
                           help="Weather this Label is the beginning of a Label Tree.")
create_label_parser.add_argument('parent_leaf_id',
                           type=int,
                           help="Label Leaf id of the parent Leaf.")
create_label_parser.add_argument('name',
                           type=str,
                           required=True,
                           help="Label Leaf name")

create_label_parser.add_argument('description',
                           type=str,
                           required=True,
                           help="Label Leaf Description.")

create_label_parser.add_argument('abbreviation',
                           type=str,
                           required=True,
                           help="Label Leaf Abbreviaiton.")

create_label_parser.add_argument('external_id',
                           type=str,
                           help="External Label Leaf ID.")
create_label_parser.add_argument('color',
                           type=str,
                           help="Color of Label Leaf.")