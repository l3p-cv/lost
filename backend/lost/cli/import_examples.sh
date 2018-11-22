if [ ${ADD_EXAMPLES} = "True" ]; then
python3 import_pipe_project.py '../pyapi/examples/pipes/sia'
python3 import_pipe_project.py '../pyapi/examples/pipes/anno_all_imgs'
python3 import_label_tree.py '../pyapi/examples/label_trees/dummy_label_tree.csv'
python3 import_label_tree.py '../pyapi/examples/label_trees/pascal_voc2012.csv'
cp -r ../pyapi/examples/images/10_voc2012 $LOST_HOME/data/media
fi