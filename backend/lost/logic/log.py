import logging

def get_file_logger(name, file_path):
    logger = logging.getLogger(name)
    fh = logging.FileHandler(file_path)
    fh.setLevel(logging.DEBUG)
    fh.mode = 'a'
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s : %(message)s')
    fh.setFormatter(formatter)
    logger.addHandler(fh)
    logger.setLevel(logging.DEBUG)
    return logger

def get_stream_logger(name, stream):
    logger = logging.getLogger(name)
    sh = logging.StreamHandler(stream)
    sh.setLevel(logging.DEBUG)
    sh.mode = 'a'
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s : %(message)s')
    sh.setFormatter(formatter)
    logger.addHandler(sh)
    logger.setLevel(logging.DEBUG)
    return logger