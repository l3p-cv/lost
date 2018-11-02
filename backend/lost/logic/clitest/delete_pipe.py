import json, argparse

from lost.logic.pipeline import service as pipeline
from lost.logic.util.testdata_factory import Factory


def start_sia_preboxed_pipe(pipe_id):
        with Factory() as factory:
            pipeline.delete(factory.db_man, pipe_id)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Delete a pipeline by its ID')
    parser.add_argument('--id', nargs='?', action='store',
                        help='ID of Pipeline.')
    args = parser.parse_args()
    if args.id is None:
        raise Exception("An ID is mandatory!")
    else:
        start_sia_preboxed_pipe(args.id)