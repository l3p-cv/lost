if [ ${ADD_EXAMPLES} = "True" ]; then
python3 import_pipe_project.py '../pyapi/examples/pipes/sia'
python3 import_pipe_project.py '../pyapi/examples/pipes/mia'
python3 import_pipe_project.py '../pyapi/examples/pipes/two_stage_anno'
python3 import_pipe_project.py '../pyapi/examples/pipes/all_elements'
python3 import_label_tree.py '../pyapi/examples/label_trees/dummy_label_tree.csv'
python3 import_label_tree.py '../pyapi/examples/label_trees/pascal_voc2012.csv'
cp -r ../pyapi/examples/images/ $LOST_HOME/data/media
fi