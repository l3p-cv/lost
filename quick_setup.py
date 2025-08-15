import argparse
import os
import logging
import shutil
from cryptography.fernet import Fernet


def replace_line_in_file(filepath: str, key: str, new_value: str):
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

        # replace line if key found
        updated_lines = []
        found = False
        for line in lines:
            if line.strip().startswith(f"{key}="):
                updated_lines.append(f"{key}={new_value}\n")
                found = True
            else:
                updated_lines.append(line)

        # add line if key not found
        if not found:
            updated_lines.append(f"{key}={new_value}\n")

        # overwrite file
        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(updated_lines)


def main(base_dir: str, release: str | None):
    # create base directory
    try:
        os.makedirs(base_dir)
        logging.info("Created: {}".format(base_dir))
    except OSError:
        logging.warning("Path already exists: {}".format(base_dir))
        return

    # copy compose files
    dst_compose_path = os.path.join(base_dir, "compose.yaml")
    dst_logging_path = os.path.join(base_dir, "logging.compose.yaml")
    dst_env_path = os.path.join(base_dir, ".env")
    shutil.copy("docker/compose/compose.yaml", dst_compose_path)
    shutil.copy("docker/compose/logging.compose.yaml", dst_logging_path)
    shutil.copy("docker/compose/.env", dst_env_path)

    # adjust entries in .env
    secret_key: str = Fernet.generate_key().decode()
    print("SEC")
    replace_line_in_file(dst_env_path, "LOST_SECRET_KEY", secret_key)

    if release is not None:
        replace_line_in_file(dst_env_path, "LOST_VERSION", release)

    # give the user some information
    logging.info("")
    logging.info("Finished setup! To start LOST run:")
    logging.info("======================================================")
    logging.info("1) Type the command below into your command line:")
    logging.info(f"   cd {base_dir}; docker compose up")
    logging.info("2) Open your browser and navigate to: http://localhost")
    logging.info("    Login user:     admin")
    logging.info("    Login password: admin")
    logging.info("======================================================")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="(%(levelname)s): %(message)s")

    parser = argparse.ArgumentParser(description="Quick setup for lost on linux")
    parser.add_argument("install_path", help="Specify path to install lost.")
    parser.add_argument(
        "--release", help="LOST release you want to install.", default=None
    )
    args = parser.parse_args()

    main(args.install_path, args.release)
