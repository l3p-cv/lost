from lost.logic.jobs.jobs import export_ds

def main(include_images=False, annotated_images_only=False):
    pe_id = 3162
    user_id = 9
    export_id = 246
    export_type = "LOST_Dataset"
    splits = None
    export_name = 'LOST_Annotation'

    export_ds(pe_id, user_id, 
            export_id, export_name, splits, 
            export_type, include_imgs=include_images, 
            annotated_images_only=annotated_images_only)
    
 
if __name__ == '__main__':
    main()