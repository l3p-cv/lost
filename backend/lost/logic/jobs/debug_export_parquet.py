from datetime import datetime

from lost.logic.jobs.jobs import export_dataset_parquet


def main():
    user_id = 2
    path = f"/home/lost/data/2/ds_exports/{datetime.now().strftime('%Y-%m-%d_%H-%M')}.parquet"
    fs_id = 3
    dataset_id = 1
    export_dataset_parquet(user_id, path, fs_id, dataset_id)


if __name__ == "__main__":
    main()
