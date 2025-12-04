#!/usr/bin/env python3

import argparse
import logging

import lostconfig as config
from lost.db.access import DBMan
from lost.logic.file_access import UserFileAccess

logging.basicConfig(level=logging.INFO, format="(%(levelname)s): %(message)s")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Copy example data for the admin user")
    parser.add_argument("src", nargs="?", action="store", help="Source dir with example data to copy")
    args = parser.parse_args()

    lostconfig = config.LOSTConfig()
    dbm = DBMan(lostconfig)
    admin_fs = dbm.get_user_default_fs(1)
    admin = dbm.get_user_by_id(1)
    ufa = UserFileAccess(dbm, admin, admin_fs)
    ufa.fm.fs.put(args.src, ufa.get_media_path(), recursive=True)
    logging.info(f"Copyed images from {args.src} to {ufa.get_media_path()}")
