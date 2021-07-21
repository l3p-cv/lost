if [ ${LOST_ADD_EXAMPLES} = "True" ]; then
python3 import_pipe_project.py '../pyapi/examples/pipes/no_ai'
python3 import_label_tree.py '../pyapi/examples/label_trees/pascal_voc2012.csv'
python3 import_label_tree.py '../pyapi/examples/label_trees/dummy_label_tree.csv'
    if [ ${LOST_ADD_AI_EXAMPLES} = "True" ]; then
    python3 import_pipe_project.py '../pyapi/examples/pipes/sia'
    python3 import_pipe_project.py '../pyapi/examples/pipes/mia'
    python3 import_pipe_project.py '../pyapi/examples/pipes/two_stage'
    fi
python3 copy_examples.py ../pyapi/examples/images
fi