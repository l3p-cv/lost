from flask_restx import reqparse

annotask_parser = reqparse.RequestParser()
annotask_parser.add_argument("id", type=int, required=True, help="Id of the annotask.")


update_group_parser = reqparse.RequestParser()

update_group_parser.add_argument(
    "groupId", type=int, required=True, help="The Id of the group the task is supposed to belong to.", dest="group_id"
)

annotask_config_parser = reqparse.RequestParser()
annotask_config_parser.add_argument("id", type=int, required=True, help="Id of the annotask.")


annotask_config_parser = reqparse.RequestParser()

# Tools Configuration
# TODO: Build parser to parse nested configuration list
annotask_config_parser.add_argument("configuration", type=dict, required=False, help="Annotask Config")

storage_parser = reqparse.RequestParser()

storage_parser.add_argument("datasetId", type=int, required=True, help="Dataset ID", dest="dataset_id")

generate_export_parser = reqparse.RequestParser()

generate_export_parser.add_argument("exportName", type=str, required=True, help="Dataset ID", dest="export_name")
generate_export_parser.add_argument(
    "exportType",
    type=str,
    required=True,
    help="one of the following: LOST_Dataset, PascalVOC, YOLO, MS_Coco, CSV",
    dest="export_type",
)
generate_export_parser.add_argument("includeImages", type=bool, required=True, help="Dataset ID", dest="include_images")
generate_export_parser.add_argument("annotatedOnly", type=bool, required=True, help="Dataset ID", dest="annotated_only")
generate_export_parser.add_argument("randomSplits", type=dict, required=True, help="Dataset ID", dest="random_splits")


get_annotasks_parser = reqparse.RequestParser()
get_annotasks_parser.add_argument("pageSize", type=int, help="Page Size", location="args", dest="page_size")
get_annotasks_parser.add_argument("page", type=int, help="Loaded Page", location="args", dest="page")
get_annotasks_parser.add_argument(
    "filteredName", type=str, help="Name to filter for", location="args", dest="filtered_name"
)
get_annotasks_parser.add_argument(
    "filteredStates", type=str, help='List of filtered States seperated by ","', location="args", dest="filtered_states"
)

patch_annotation_parser = reqparse.RequestParser()
patch_annotation_parser.add_argument(
    "action",
    required=True,
    type=str,
    help="Anno Action",
)
patch_annotation_parser.add_argument(
    "anno",
    type=dict,
    help="Annotation Data",
)
patch_annotation_parser.add_argument(
    "img",
    type=dict,
    help="Image Data",
)
