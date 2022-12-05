
# Step by step instruction: Start your first annotation Pipeline
## Login
1. Login with your user on your hosted LOST instance

## Upload images
1. Navigate to "Datasources" on the left navigation bar
2. Click on the "Browse" button for the datasource already created for your user - For example: the default datasource of the user "admin" is also called "admin"
3. Click on "Create folder" and give it a name of your choice, for example "myManyImages" 
4. Navigate into that folder
5. Click on the upload Area below the folder view
6. Choose images from your local machine
7. Click "Upload"
8. Congratulations: You have successfully uploaded your first images into LOST

## Create labels
1. Navigate to "Labels" on the left navigation bar
2. Enter a name (for example: "myLabelTree") and a description for a new label tree and click on the "Add" Button
3. Click on the "Edit" Button for your new created label tree
4. Select the only visible node (for example: "myLabelTree")
5. Add as many child labels as you want - you can provide a description, abbreviation and a label color as well - but you don't have to
6. Congratulations: you have successfully created your first label tree with some child labels

## Start Pipeline
1. Navigate to "Start Pipeline" on the left navigation bar
2. Select the pipeline "sia.all_tools" by clicking on that row
3. Click on the first pipeline element "Datasource" - a modal opens
4. Select your user default datasource from the dropdown (for example: "admin")
5. Search for the folder you created earlier that contains the uploaded images, for example "myManyImages"
6. Click on "Okay" - the modal closes
7. Click on the "Annotation Task" - a modal opens
8. Provide a name and the instructions for that annotation task (or just use the default entries)
9. Click on the user icon in top of the modal
10. Select your own user (for example: "admin")
11. Now select the previously created label tree (for example: "myLabelTree")
12. Click on the parent node of that label tree in order to provide all its child labels for the annotation task
13. Click on okay - the modal closes
14. Click on the "List" icon in top of the pipeline view and fill out a name and a description for your first pipeline
15. Click on the "Check" icon in top of the pipeline view and start your pipeline !
16. Congratulations: You have successfully started your first annotation pipeline !

## Annotate 
1. Navigate to "Annotation" on the left navigation bar
2. Wait until your first annotation task will show up in the table
3. Click on that annotation task
4. The Single Image Annotation Tool will show up now - you are ready to annotate !
5. Explanations on how to use SIA can be found by clicking on the question mark in the left toolbar

## Export Annotations 
You can download your annotations instantly at any time:
1. Navigate to "Pipelines" on the left navigation bar
2. Click on your previously starte pipeline in the table
3.  Cick on the "Annotation Task" element in that pipeline - a modal opens
4. Click on "CSV - Download" in order to download all the annotations of that annotation task at the time of clicking on the button.
5. Open your downloaded csv file with your preferred application