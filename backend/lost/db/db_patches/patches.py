from lost.db.db_patches import patch_0_0_0, patch_0_1_0, patch_0_2_0,patch_0_3_0

patch_dict = {
    '0.0.0' : patch_0_0_0.run_all,
    '0.1.0' : patch_0_1_0.run_all,
    '0.2.0' : patch_0_2_0.run_all,
    '0.3.0' : patch_0_3_0.run_all,
}