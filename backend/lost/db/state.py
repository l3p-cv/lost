__author__ = 'Jonas Jaeger'

class AnnoTask():
    '''Indicates the state of an AnnoTask.

    Attributes:
        PENDING (1): The task was just created and annotators have been assigned to
            this AnnoTask.
        IN_PROGRESS (2): Annotators are working on this task.
        FINISHED (3): All required annos for this AnnoTask have been
            processed by annotators.
        PAUSED (4): Task is not finished but should not be further processed by
            annotators for the moment.
    '''
    PENDING = 1
    IN_PROGRESS = 2
    FINISHED = 3
    PAUSED = 4

class Anno():
    '''State of an Anno.

    Indicates wether an Anno is already in use (is processed) by an
    annotator or not. This is important for AnnoTasks that are
    annotated by mulitple annotators at the same time, in order to prevent
    multiple access of the same Anno.

    Attributes:
        UNLOCKED (1): This anno can be requested and processed by an assigned
            annotator.
        LOCKED (2): This anno is already in use and can not be requested by
            another annotator.
        LOCKED_PRIORITY (3): Required for MIA
        LABELED (4): This anno has been annotated by a human annotator.
    '''
    UNLOCKED = 1
    LOCKED = 2
    LOCKED_PRIORITY = 3
    LABELED = 4
    LABELED_LOCKED = 5
    JUNK = 6

class Pipe():
    '''State of a Pipe

    Attributes:
        PENDING (0): A pipe is ready to be executed.
        IN_PROGRESS (1): This pipe is beeing processed.
        FINISHED (2): All PipeElements in pipeline are executed and finished.
        DELETED (3): This pipe is marked as deleted.
        ERROR (4): Indicates that a Script in pipeline has an error.
        PAUSED (5): Pipe is paused.
    '''
    PENDING = 0
    IN_PROGRESS = 1
    FINISHED = 2
    DELETED = 3
    ERROR = 4
    PAUSED = 5

class PipeElement():
    '''State of a PipeElement.

    Attributes:
        PENDING (0): This element is ready to be executed by chron job.
        IN_PROGRESS (1): This element is beeing processed.
        FINISHED (2): This element has been executed and is finished.
        SCRIPT_ERROR (4): Indicates that a user script threw an Exception. The
            exception message should have been written to *error_msg* in
            :class:`lost.db.model.PipeElement`
    '''
    PENDING = 0
    IN_PROGRESS = 1
    FINISHED = 2
    SCRIPT_ERROR = 3
