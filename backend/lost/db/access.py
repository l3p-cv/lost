import sqlalchemy
from sqlalchemy import exists
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import or_
from lost.db import model, state, dtype
import os

def convert_connection_str(lostconfig):
    '''Convert connection string from config format to sqlalchemy format.

    Args:
        connection_str (str): Connection string in format:
            *server=127.0.0.1:3306;uid=test_user;pwd=1234;database=test_db*

    Returns:
        str: *mysql+mysqldb://user:pwd@server_ip:port/database*
    '''
    #out = CONNECTOR + "://" + lostconfig.lost_db_user + ":" + lostconfig.lost_db_pwd + "@" + lostconfig.lost_db_ip + "/" + lostconfig.lost_db_name
    out = lostconfig.db_connector + "://" + lostconfig.lost_db_user + ":" + lostconfig.lost_db_pwd + "@" + lostconfig.lost_db_ip +":"+ lostconfig.lost_db_port + "/" + lostconfig.lost_db_name
    return out

class DBMan(object):
    """Database access manager for Project database.
    """
    def __init__(self, lostconfig, debug=False):
        '''Init database connection

        Args:
            lostconfig (object): :class:`lost.pyapi.parse.LOSTConfig`
            debug (bool): If True, echo database communication.
        '''
        orm_connection_str = convert_connection_str(lostconfig)
        self.engine = sqlalchemy.create_engine(orm_connection_str, echo=debug,
                                               poolclass=NullPool)
        self.__Session = sessionmaker(bind=self.engine)
        self.session = self.__Session()
        self.lostconfig = lostconfig

    def create_database(self):
        '''Create all tables that are modeled in *data_model.project* in database.

        Note:
            An empty database needs to be already present. Otherwise this
            method will not work.
        '''
        #Use this line to crate the tables
        model.Base.metadata.create_all(self.engine)

    def drop_all(self):
        '''Drop all tables in database'''
        model.Base.metadata.drop_all(self.engine)

    def new_session(self):
        '''Cerate new orm session for this DBManager'''
        self.session.close()
        self.session = self.__Session()

    def close_session(self):
        '''Close current session  for this DBManager'''
        self.session.close()
        del self.session

    def add(self, obj):
        '''Add an object to current session.

        Args:
            obj (object): An object from data_model.
        Note:
            After an object was added it is not stored in database. It is just
            marked, that it will be stored with the next call of the commit
            method.
        '''
        self.session.add(obj)

    def delete(self, obj):
        self.session.delete(obj)

    def commit(self):
        '''Store all added /deleted object to database.'''
        self.session.commit()

    def save_obj(self, obj):
        '''Store an object to database.

        Args:
            obj (object): An object from data_model.
        '''
        self.session.add(obj)
        self.session.commit()

    def get_anno_task(self, anno_task_id=None, pipe_element_id=None, state=None):
        '''Get an AnnoationTask object.

        Args:
            anno_task_id (int): Get object by annotask_id.
            pipe_element_id (int): Get object by pipe_element_id.

        Returns:
            :class:`.project.AnnoTask`
        '''
        if anno_task_id is not None:
            return self.session.query(model.AnnoTask)\
                .filter(model.AnnoTask.idx==anno_task_id).first()
        elif pipe_element_id is not None:
            return self.session.query(model.AnnoTask)\
                .filter(model.AnnoTask.pipe_element_id==pipe_element_id).first()
        elif state is not None:
            return self.session.query(model.AnnoTask)\
                .filter(model.AnnoTask.state==state).all()
        else:
            raise Exception("One of the arguments need to be not None.")

    def get_available_annotask(self, group_ids):
        '''Get all available annotation task by group_ids and state != pending

        Args:
            group_ids [int]: IDs of groups

        Returns:
            :class:`.project.AnnoTask`
        '''
        return self.session.query(model.AnnoTask).filter((model.AnnoTask.state!=state.AnnoTask.PENDING) &\
        (model.AnnoTask.group_id.in_(group_ids))).order_by(model.AnnoTask.idx.desc()).all()

    def get_pipe(self, pipe_id=None, pipe_template_id=None):
        '''Get a pipe object.

        Args:
            pipe_id (int): Id of the desired pipe.
            pipe_template_id (int):

        Returns:
            :class:`.project.Pipe`
        '''
        if pipe_id is not None:
            return self.session.query(model.Pipe).filter(model.Pipe.idx==pipe_id).first()
        elif pipe_template_id is not None:
            return self.session.query(model.Pipe)\
                    .filter(model.Pipe.pipe_template_id==pipe_template_id).first()
        else:
            raise Exception("db_access.get_pipe: Need to specify one of the arguments!")

    def get_all_pipes(self):
        '''Get all pipes in project

        Returns:
            list of :class:`.project.Pipe`
        '''
        return self.session.query(model.Pipe).all()

    def get_pipes_to_process(self):
        '''Get all :class:`project.Pipe` objects that are not finished.

        Returns:
            list: A list of :class:`project.Pipe` objects
        '''
        return self.session.query(model.Pipe)\
            .filter((model.Pipe.state!=state.Pipe.FINISHED) &\
                    (model.Pipe.state!=state.Pipe.DELETED) &\
                    (model.Pipe.state!=state.Pipe.PAUSED)).all()

    def get_pipes(self, group_ids):
        '''Get all :class:`project.Pipe` objects that are not finished.

        Args:
            group_ids [int]: List of group ids to search for.

        Returns:
            list: A list of :class:`project.Pipe` objects
        '''
        return self.session.query(model.Pipe)\
            .filter((model.Pipe.group_id.in_(group_ids) &  (model.Pipe.state!=state.Pipe.DELETED) )).all()
                    
    def get_all_pipeline_templates(self, group_id=None, global_only=False, add_global=False):
        '''Get all PipeTemplate objects in db.

        Returns:
            list: :class:`.project.PipeTemplate`
        '''
        if group_id:
            if add_global:
                return self.session.query(model.PipeTemplate)\
                    .filter(or_(model.PipeTemplate.group_id==group_id, model.PipeTemplate.group_id == None)).all()
            else:
                return self.session.query(model.PipeTemplate)\
                    .filter(model.PipeTemplate.group_id==group_id).all()
        if global_only:
            return self.session.query(model.PipeTemplate)\
                .filter(model.PipeTemplate.group_id==None).all()

        return self.session.query(model.PipeTemplate).all()

    def get_pipe_template(self, pipe_template_id=None):
        '''Get a single PipeTemplate.

        Returns:
            :class:`.project.PipeTemplate`
        '''
        return self.session.query(model.PipeTemplate)\
            .filter(model.PipeTemplate.idx==pipe_template_id).first()

    def get_pipe_template_by_pipe_project(self, pipe_project_name):
        '''Get PipeTemplates by pipe_project name

        Returns:
            list: List of PipeTemplates
        '''
        return self.session.query(model.PipeTemplate)\
            .filter(model.PipeTemplate.pipe_project==pipe_project_name).all()

    def get_script(self, script_id=None, name=None, file_name=None):
        '''Get a script object from database.

        Args:
            script_id (int): Get object by script_id.
            name (str): Get script by name.
            file_name (str): Get a script by file_name.
            path (str): Get a script by path

        Returns:
            :class:`.project.Script`
        '''
        if script_id is not None:
            return self.session.query(model.Script)\
                .filter(model.Script.idx==script_id).first()
        elif name is not None:
            return self.session.query(model.Script)\
                .filter(model.Script.name==name.lower()).first()
        elif file_name is not None:
            return self.session.query(model.Script)\
                .filter(model.Script.path.contains(file_name)).first()
        else:
            raise Exception("lost.db.access.get_script: You need to specify one of the arguments")

    def get_pipe_elements(self, pipe_id):
        '''Get a list of PipeElements

        Args:
            pipe_id (int): Get list by pipe_id.

        Returns:
            list of :class:`.project.PipeElement`
        '''
        return self.session.query(model.PipeElement)\
            .filter(model.PipeElement.pipe_id==pipe_id).all()
            

    def get_pipe_element(self, pipe_e_id=None, script_id=None):
        '''Get an PipeElement

        Args:
            pipe_e_id (int): Get PipeElement by PipeElement ID.

        Returns:
            :class:`.project.PipeElement`
        '''
        if pipe_e_id is not None:
            return self.session.query(model.PipeElement)\
                .filter(model.PipeElement.idx==pipe_e_id).first()
        elif script_id is not None:
            return self.session.query(model.PipeElement)\
                .filter(model.PipeElement.script_id==script_id).first()
        else:
            raise Exception("One of the arguments need to be not None.")

    def get_image_anno(self, img_anno_id):
        ''' get a single image annotation
        '''
        return self.session.query(model.ImageAnno).filter(model.ImageAnno.idx==img_anno_id).first()

    def get_image_annotations(self, anno_task_id):
        '''Get a list of ImageAnnos.

        Args:
            anno_task_id (int): Get annotations by anno_task_id.

        Returns:
            list of :class:`.project.ImageAnno`
        '''
        return self.session.query(model.ImageAnno)\
            .filter(model.ImageAnno.anno_task_id==anno_task_id).all()

    def get_image_annotations_by_ids(self, anno_task_id, user_id, ids):
        ''' Get list of image annotation by it's ids
        '''
        return self.session.query(model.ImageAnno)\
            .filter(model.ImageAnno.anno_task_id==anno_task_id, model.ImageAnno.user_id==user_id, model.ImageAnno.idx.in_(ids)).all()

    def get_image_annotations_by_state(self, anno_task_id, state, user_id, amount):
        ''' Get all Image Anno by annotask, state and user_id
        '''
        if (amount > 0):
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.state==state,\
                                                          model.ImageAnno.anno_task_id== anno_task_id,\
                                                          model.ImageAnno.user_id==user_id)\
                                                          .limit(amount).all()
        else:
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.state==state,\
                                                          model.ImageAnno.anno_task_id== anno_task_id,\
                                                          model.ImageAnno.user_id==user_id).all()


    def get_image_annotation_by_sim_class(self, anno_task_id, sim_class, amount):
        ''' Get unlocked image annotations by sim_class and anno task
        '''
        return self.session.query(model.ImageAnno).filter(model.ImageAnno.state==state.Anno.UNLOCKED,\
                                                      model.ImageAnno.anno_task_id== anno_task_id,\
                                                      model.ImageAnno.sim_class==sim_class)\
        .limit(amount).all()

    def get_random_sim_class_img_anno(self, anno_task_id):
        ''' get a random sim class of one anno task (created by db)
        '''
        sql = "SELECT sim_class FROM image_anno WHERE anno_task_id=%d AND state=%d ORDER BY RAND() LIMIT 1"\
        %(anno_task_id, state.Anno.UNLOCKED)
        return self.session.execute(sql).first()

    def get_all_img_annos(self):
        '''Get a list of all ImageAnnos in database.

        Returns:
            list of :class:`.project.ImageAnno`
        '''
        return self.session.query(model.ImageAnno).all()

    def get_locked_img_annos(self, anno_task_id):
        return self.session.query(model.ImageAnno)\
            .filter((model.ImageAnno.anno_task_id==anno_task_id)\
                    & ((model.ImageAnno.state == state.Anno.LOCKED)\
                    | (model.ImageAnno.state == state.Anno.LABELED_LOCKED)\
                       | (model.ImageAnno.state == state.Anno.LOCKED_PRIORITY))).all()

    def get_locked_two_d_annos(self, anno_task_id):
        return self.session.query(model.TwoDAnno)\
            .filter((model.TwoDAnno.anno_task_id==anno_task_id)\
                    & ((model.TwoDAnno.state == state.Anno.LOCKED)\
                    | (model.TwoDAnno.state == state.Anno.LABELED_LOCKED)\
                       | (model.TwoDAnno.state == state.Anno.LOCKED_PRIORITY))).all()

    def get_resultlinks_pe_n(self, pe_n_id):
        '''Get result links for pe_n.
        '''
        return self.session.query(model.ResultLink)\
        .filter(model.ResultLink.pe_n==pe_n_id).all()

    def get_resultlinks_pe_out(self, pe_out_id):
        '''Get result links for pe_out.
        '''
        return self.session.query(model.ResultLink)\
        .filter(model.ResultLink.pe_out==pe_out_id).all()
    
    def get_all_resultlinks(self):
        '''Get all result links.
        '''
        return self.session.query(model.ResultLink).all()

    def get_result(self, result_id):
        '''Get result by id.
        '''
        return self.session.query(model.Result)\
        .filter(model.Result.idx==result_id).first()


    def get_all_required_label_leaves(self, anno_task_id=None, label_leaf_id=None):
        '''Get required label leaves by anno_task_id
        '''
        if not anno_task_id is None:
            return self.session.query(model.RequiredLabelLeaf)\
            .filter(model.RequiredLabelLeaf.anno_task_id==anno_task_id).all()
        elif not label_leaf_id is None:
            return self.session.query(model.RequiredLabelLeaf)\
            .filter(model.RequiredLabelLeaf.label_leaf_id==label_leaf_id).all()
    def get_label_leaf(self, label_leaf_id):
        '''Get label leaf by idx
        '''
        return self.session.query(model.LabelLeaf)\
        .filter(model.LabelLeaf.idx==label_leaf_id).first()

    def get_all_label_names(self):
        '''Get a list of all label definitions in database.

        Returns:
            list: A list of :class:`lost.db.model.LabelName` objects.
        '''
        return self.session.query(model.LabelName).all()

    def get_all_datasource(self):
        ''' Get all datasource
        '''
        return self.session.query(model.Datasource).all()

    def get_datasource(self, datasource_id=None, name=None, pipe_element_id=None):
        ''' Get single datasource by id
        '''
        if datasource_id is not None:
            return self.session.query(model.Datasource)\
            .filter(model.Datasource.idx==datasource_id).first()
        elif name is not None:
            return self.session.query(model.Datasource)\
            .filter(model.Datasource.name==name).first()
        elif pipe_element_id is not None:
            query_result = self.session.query(model.Datasource)\
               .filter(model.Datasource.pipe_element_id==pipe_element_id)
            return query_result.first()
        else:
            raise Exception('Need to specify one of the method parameters')

    def get_data_exports(self, result_id):
        ''' Get data_export by result_id
        '''
        return self.session.query(model.DataExport)\
        .filter(model.DataExport.result_id==result_id).all()

    def get_data_export(self, de_id):
        ''' Get data_export by id
        '''
        return self.session.query(model.DataExport)\
        .filter(model.DataExport.idx==de_id).first()

    def get_visual_outputs(self, result_id):
        ''' Get visual_output by result_id
        '''
        return self.session.query(model.VisualOutput)\
        .filter(model.VisualOutput.result_id==result_id).all()

    def get_choosen_annotask(self, user_id=None, anno_task_id=None):
        ''' Get choosen annotation task of one user by user_id
        '''
        if user_id is not None:
            return self.session.query(model.ChoosenAnnoTask)\
            .filter(model.ChoosenAnnoTask.user_id == user_id).all()
        elif anno_task_id is not None:
            return self.session.query(model.ChoosenAnnoTask)\
            .filter(model.ChoosenAnnoTask.anno_task_id == anno_task_id).all()
        else:
            raise Exception('Need to specify one of the method parameters')

    def count_image_remaining_annos(self, anno_task_id):
        ''' Count the remaining image annotation of an annotation task
        '''

        sql = "SELECT COUNT(state) AS r FROM image_anno WHERE anno_task_id=%d AND state!=%d AND state!=%d"\
         %(anno_task_id, state.Anno.LABELED, state.Anno.LABELED_LOCKED)
        return self.session.execute(sql).first()

    def count_all_image_annos(self, anno_task_id, iteration=0):
        ''' Count the all image annotation of an annotation task
        '''
        return self.session.query(sqlalchemy.func.count(model.ImageAnno.idx))\
        .filter(model.ImageAnno.anno_task_id == anno_task_id, model.ImageAnno.iteration == iteration)

    def get_all_image_annos_by_iteration(self, anno_task_id, iteration):
        ''' Get all image annotation of an annotation task by iteration
        '''
        return self.session.query(model.ImageAnno)\
        .filter(model.ImageAnno.iteration==iteration, model.ImageAnno.anno_task_id==anno_task_id).all()
    
    def get_all_image_annos(self, anno_task_id):
        ''' Get all image annotation of an annotation task
        '''
        return self.session.query(model.ImageAnno)\
        .filter(model.ImageAnno.anno_task_id==anno_task_id).all()

    def get_user(self, user_id):
        ''' Get User by its id
        '''
        return self.session.query(model.User)\
        .filter(model.User.idx==user_id).first()

    def get_image_annotation(self, img_anno_id=None, result_id=None):
        ''' Get single image annotation by it's id or result_id
        '''
        if img_anno_id is not None:
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.idx==img_anno_id).first()
        elif result_id is not None:
            return self.session.query(model.ImageAnno)\
            .filter(model.ImageAnno.result_id==result_id).all()
        else:
            raise Exception('Need to specify one of the method parameters')

    def get_image_annotation_interval(self, result_id, date_from, date_to):
        ''' Get image annotations by result_id and time interval
        '''
        return self.session.query(model.ImageAnno).filter(model.ImageAnno.result_id==result_id, \
                                                       model.ImageAnno.timestamp>=date_from, \
                                                       model.ImageAnno.timestamp<=date_to).all()
    


    def get_next_unlocked_sia_anno(self, anno_task_id, iteration):
        ''' Get next sia annotation of an anno_task
        '''
        return self.session.query(model.ImageAnno).with_for_update().filter(model.ImageAnno.anno_task_id==anno_task_id, \
                                                       model.ImageAnno.state==state.Anno.UNLOCKED, \
                                                       model.ImageAnno.iteration==iteration).order_by(model.ImageAnno.idx.asc()).first()

    def get_next_locked_sia_anno(self, anno_task_id, user_id, iteration):
        ''' Get next sia annotation of an anno_task
        '''
        # sql = "SELECT * FROM image_anno WHERE anno_task_id=%d AND state=%d AND user_id=%d AND iteration=%d LIMIT 2"\
        #  %(anno_task_id, state.Anno.LOCKED, user_id, iteration)
        return self.session.query(model.ImageAnno).filter(model.ImageAnno.anno_task_id==anno_task_id, \
                                                       model.ImageAnno.state==state.Anno.LOCKED, \
                                                       model.ImageAnno.user_id==user_id, \
                                                       model.ImageAnno.iteration==iteration).all()

    def get_next_sia_anno_by_last_anno(self, anno_task_id, user_id, img_anno_id, iteration):
        ''' Get next sia annotation of an anno_task
        '''
        # sql = "SELECT * FROM image_anno WHERE user_id=%d AND anno_task_id=%d AND idx>%d AND iteration=%d LIMIT 1"\
        #  %(user_id, anno_task_id, img_anno_id, iteration)
        return self.session.query(model.ImageAnno).filter(model.ImageAnno.anno_task_id==anno_task_id, \
                                                       model.ImageAnno.user_id== user_id, \
                                                       model.ImageAnno.idx > img_anno_id, \
                                                       model.ImageAnno.iteration==iteration).first()

    def get_two_d_anno_by_img_anno(self, img_anno_id, iteration):
        ''' Get all two_d annotation of an image annotation
        '''
        return self.session.query(model.TwoDAnno).filter(model.TwoDAnno.img_anno_id==img_anno_id,\
                                                            model.TwoDAnno.iteration==iteration).all()

    def get_lonely_two_d_annos(self):
        ''' Get all two_d annotation that are not assigned to an image
        '''
        return self.session.query(model.TwoDAnno).filter(model.TwoDAnno.img_anno_id==None).all()

    def get_previous_sia_anno(self, anno_task_id, user_id, img_anno_id, iteration):
        ''' Get a previous image annotation by current annotation id
        '''
        sql = "SELECT * FROM image_anno WHERE iteration=%d AND anno_task_id=%d AND idx=(SELECT max(idx)\
         FROM image_anno WHERE idx<%d\
         AND user_id=%d)"\
         %(iteration, anno_task_id, img_anno_id, user_id)
        img_anno = self.session.execute(sql).first()
        if img_anno:
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.idx==img_anno.idx).first()
        else:
            return None


    def get_all_two_d_label(self, two_d_anno_id):
        ''' Get all label of a two_d annotation
        '''
        return self.session.query(model.Label).filter(model.Label.two_d_anno_id==two_d_anno_id).all()

    def get_two_d_anno(self, two_d_anno_id=None, img_anno_id=None):
        ''' Get a single BBoxAnno by its id or img_anno_id
        '''
        if two_d_anno_id is not None:
            return self.session.query(model.TwoDAnno).filter(model.TwoDAnno.idx==two_d_anno_id).first()
        elif img_anno_id is not None:
            return self.session.query(model.TwoDAnno)\
            .filter(model.TwoDAnno.img_anno_id==img_anno_id).all()
        else:
            raise Exception('Need to specify one of the method parameters')

    def get_all_scripts(self):
        ''' Get all available scripts
        '''
        return self.session.query(model.Script).all()

    def get_loop(self, loop_id=None, pipe_element_id=None):
        ''' Get single loop by its id
        '''
        if loop_id:
            return self.session.query(model.Loop).filter(model.Loop.idx == loop_id).first()
        elif pipe_element_id:
            return self.session.query(model.Loop)\
            .filter(model.Loop.pipe_element_id==pipe_element_id).first()
    def get_last_sia_anno(self, anno_task_id , iteration, user_id):
        ''' Get last locked sia annotation
        '''
        sql = "SELECT * FROM image_anno WHERE idx=(SELECT max(idx)\
         FROM image_anno WHERE iteration=%d AND anno_task_id=%d AND user_id=%d)"\
         %(iteration, anno_task_id, user_id)
        return self.session.execute(sql).first()

    def get_last_edited_sia_anno(self, anno_task_id , iteration, user_id):
        ''' Get last locked sia annotation
        '''
        sql = "SELECT * FROM image_anno WHERE idx=(SELECT max(idx)\
         FROM image_anno WHERE iteration=%d AND anno_task_id=%d AND user_id=%d AND state=%d)"\
         %(iteration, anno_task_id, user_id, state.Anno.LABELED)
        return self.session.execute(sql).first()

    def get_first_sia_anno(self, anno_task_id, iteration, user_id ):
        ''' Get first sia annotation of an user
        '''
        sql = "SELECT * FROM image_anno WHERE idx=(SELECT min(idx)\
         FROM image_anno WHERE anno_task_id=%d AND iteration=%d AND user_id=%d )"\
         %(anno_task_id, iteration, user_id)
        return self.session.execute(sql).first()
    
    def get_all_label_trees(self, group_id=None, global_only=False, add_global=False):
        '''Get all label trees in lost'''
        if group_id:
            if add_global:
                return self.session.query(model.LabelLeaf)\
                    .filter(model.LabelLeaf.is_root == True, \
                            or_(model.LabelLeaf.group_id==group_id, model.LabelLeaf.group_id == None)).all()
            else:
                return self.session.query(model.LabelLeaf)\
                    .filter(model.LabelLeaf.is_root == True, \
                            model.LabelLeaf.group_id==group_id).all()
        if global_only:
            return self.session.query(model.LabelLeaf)\
                .filter(model.LabelLeaf.is_root == True, \
                        model.LabelLeaf.group_id==None).all()


    def get_available_users(self):
        ''' Get all available users
        '''
        return self.session.query(model.User).all()

    def get_two_d_annotations(self, img_anno_id):
        ''' Get all two_d_annotations of one image annotation
        '''
        return self.session.query(model.TwoDAnno)\
        .filter(model.TwoDAnno.img_anno_id==img_anno_id).all()
    def get_all_child_label_leaves(self, parent_leaf_id):
        ''' Get all child label leaves of a label leaf (1. order)
        '''
        return self.session.query(model.LabelLeaf)\
        .filter(model.LabelLeaf.parent_leaf_id==parent_leaf_id).all()

    def get_anno_amount(self, label_leaf_id):
        ''' count the amount of connections of a label leaf
        '''
        return self.session.query(sqlalchemy.func.count(model.Label.idx))\
        .filter(model.Label.label_leaf_id == label_leaf_id).first()[0]
    
    def get_all_datasources(self):
        ''' get all available datasources
        '''
        return self.session.query(model.Datasource).all()

    def count_annos(self, anno_task_id, iteration=None):
        '''count all annos with specific anno_task_id
        '''
        if iteration:
            return self.session.query(sqlalchemy.func.count(model.ImageAnno.idx))\
                .filter(model.ImageAnno.anno_task_id == anno_task_id, model.ImageAnno.iteration == iteration).first()[0]
        else:    
            return self.session.query(sqlalchemy.func.count(model.ImageAnno.idx))\
                .filter(model.ImageAnno.anno_task_id == anno_task_id).first()[0]
    

    def get_two_d_annotations_by_state(self, anno_task_id, state, user_id, amount):
        ''' Get all TwoDAnno by annotask, state and user id
        '''
        if (amount > 0):
            return self.session.query(model.TwoDAnno).filter(model.TwoDAnno.state==state,\
                                                            model.TwoDAnno.anno_task_id== anno_task_id,\
                                                            model.TwoDAnno.user_id==user_id)\
                                                            .limit(amount).all()
        else:
            return self.session.query(model.TwoDAnno).filter(model.TwoDAnno.state==state,\
                                                            model.TwoDAnno.anno_task_id== anno_task_id,\
                                                            model.TwoDAnno.user_id==user_id).all()

    def get_two_d_anno_by_sim_class(self, anno_task_id, sim_class, amount):
        ''' Get unlocked image annotations by sim_class and anno task
        '''
        return self.session.query(model.TwoDAnno).filter(model.TwoDAnno.state==state.Anno.UNLOCKED,\
                                                      model.TwoDAnno.anno_task_id== anno_task_id,\
                                                      model.TwoDAnno.sim_class==sim_class)\
        .limit(amount).all()
    
    def get_random_sim_class_two_d_anno(self, anno_task_id):
        ''' get a random sim class of one anno task (created by db)
        '''
        sql = "SELECT sim_class FROM two_d_anno WHERE anno_task_id=%d AND state=%d ORDER BY RAND() LIMIT 1"\
        %(anno_task_id, state.Anno.UNLOCKED)
        return self.session.execute(sql).first()
    
    def count_two_d_remaining_annos(self, anno_task_id):
        ''' Count the remaining two_d annotation of an annotation task
        '''

        sql = "SELECT COUNT(state) AS r FROM two_d_anno WHERE anno_task_id=%d AND state!=%d AND state!=%d"\
         %(anno_task_id, state.Anno.LABELED, state.Anno.LABELED_LOCKED)
        return self.session.execute(sql).first()

    def count_all_two_d_annos(self, anno_task_id, iteration):
        ''' Count the all two_d annotation of an annotation task
        '''
        return self.session.query(sqlalchemy.func.count(model.TwoDAnno.idx))\
        .filter(model.TwoDAnno.anno_task_id == anno_task_id, model.TwoDAnno.iteration == iteration)

    def get_two_d_annotation(self, two_d_anno_id=None, result_id=None):
        ''' Get single two_d annotation by it's id or result_id
        '''
        if two_d_anno_id is not None:
            return self.session.query(model.TwoDAnno).filter(model.TwoDAnno.idx==two_d_anno_id).first()
        elif result_id is not None:
            return self.session.query(model.TwoDAnno)\
            .filter(model.TwoDAnno.result_id==result_id).all()
        else:
            raise Exception('Need to specify one of the method parameters')
    
    def get_two_d_annotations_by_ids(self, anno_task_id, user_id, ids):
        ''' Get list of two_d annotation by it's ids
        '''
        return self.session.query(model.TwoDAnno)\
            .filter(model.TwoDAnno.anno_task_id==anno_task_id, model.TwoDAnno.user_id==user_id, model.TwoDAnno.idx.in_(ids)).all()

    def get_example_annotation_by_ll_id(self, label_leaf_id):
        ''' Get list of two_d annotation by label leaf id
        '''
        return self.session.query(model.TwoDAnno).join(model.Label)\
            .filter(model.Label.two_d_anno_id == model.TwoDAnno.idx,
                    model.Label.label_leaf_id == label_leaf_id,
                    model.TwoDAnno.is_example==True).all()

    def find_user_by_email(self, email):
        return self.session.query(model.User).filter(model.User.email==email).first()
    
    def find_user_by_user_name(self, user_name):
        return self.session.query(model.User).filter(model.User.user_name==user_name).first()

    def get_user_by_id(self, user_id):
        return self.session.query(model.User).filter(model.User.idx==user_id).first()

    def get_user_roles(self, user_id):
        return self.session.query(model.UserRoles).filter(model.UserRoles.user_id==user_id).order_by(model.UserRoles.role_id.asc()).all()

    def get_role(self, role_id):
        return self.session.query(model.Role).filter(model.Role.idx==role_id).first()

    def get_role_by_name(self, role_name):
        return self.session.query(model.Role).filter(model.Role.name==role_name).first()

    def get_users(self):
        return self.session.query(model.User).all()

    def get_groups(self):
        return self.session.query(model.Group).all()
        
    def get_user_groups(self, user_defaults=False):
        return self.session.query(model.Group).filter(model.Group.is_user_default==user_defaults).all()
    
    def get_group_by_name(self, group_name):
        return self.session.query(model.Group).filter(model.Group.name==group_name).first()

    def get_group_by_id(self, group_id):
        return self.session.query(model.Group).filter(model.Group.idx==group_id).first()

    def get_user_roles_by_user_id(self, user_id):
        return self.session.query(model.UserRoles).filter(model.UserRoles.user_id==user_id).all()
    
    def get_user_groups_by_user_id(self, user_id):
        return self.session.query(model.UserGroups).filter(model.UserGroups.user_id==user_id).all()
    
    def mean_anno_time(self, anno_task_id, anno_type, user_id=None):
        user_id_query = 'user_id={} AND'.format(user_id)
        if not user_id:
            user_id_query = ''
        if anno_type == 'imageBased':
            sql = "SELECT AVG(anno_time) FROM image_anno WHERE {} anno_task_id={} AND anno_time IS NOT NULL".format(user_id_query, anno_task_id)
            return self.session.execute(sql).first()
        else:
            sql = "SELECT AVG(anno_time) FROM two_d_anno WHERE {} anno_task_id={} AND anno_time IS NOT NULL".format(user_id_query, anno_task_id)
            return self.session.execute(sql).first()

    def get_worker(self, worker_name=None):
        '''Get an Worker object.

        Args:
            worker_name (str): Name of the worker to get.

        Returns:
            :class:`model.Worker`
        '''
        if worker_name is None:
            return self.session.query(model.Worker).all()
        else:
            return self.session.query(model.Worker)\
                .filter(model.Worker.worker_name==worker_name).first()

    def get_user_default_fs(self, user_idx):
        '''Get user default filesystem 

        Args:
            user_idx (int): Id of the user who own this default filesystem
        
        Retruns:
            `model.FileSystem` object: If one arg was given.
        '''
        return self.session.query(model.FileSystem)\
            .filter(model.FileSystem.user_default_id==user_idx).first()
                
    def get_fs_deleted_also(self, name=None, group_id=None, fs_id=None):
        '''Get all filesystem entries from database including deleted fs

        Args:
            name (str): Get filesystem by name.
            group_id (int): GroupID for Group or User
        
        Retruns:
            list of `model.FileSystem`: If no arg or group_id was given.
            `model.FileSystem` object: If one arg was given.
        '''
        if name is not None:
            return self.session.query(model.FileSystem)\
                .filter(model.FileSystem.name==name).first()
        elif group_id is not None:
            return self.session.query(model.FileSystem)\
                .filter(model.FileSystem.group_id==group_id).all()
        elif fs_id is not None:
            return self.session.query(model.FileSystem)\
                .filter(model.FileSystem.idx==fs_id).first()
        else:
            return self.session.query(model.FileSystem).all()

    def get_fs(self, name=None, group_id=None, fs_id=None):
        '''Get filesystem entries from database

        Args:
            name (str): Get filesystem by name.
            group_id (int): GroupID for Group or User
        
        Retruns:
            list of `model.FileSystem`: If no arg or group_id was given.
            `model.FileSystem` object: If one arg was given.
        '''
        if name is not None:
            return self.session.query(model.FileSystem)\
                .filter(model.FileSystem.deleted==False)\
                .filter(model.FileSystem.name==name).first()
        elif group_id is not None:
            return self.session.query(model.FileSystem)\
                .filter(model.FileSystem.deleted==False)\
                .filter(model.FileSystem.group_id==group_id).all()
        elif fs_id is not None:
            return self.session.query(model.FileSystem)\
                .filter(model.FileSystem.idx==fs_id).first()
        else:
            return self.session.query(model.FileSystem)\
                .filter(model.FileSystem.deleted==False).all()
    
    def get_public_fs(self):
        '''Get all public available filesystem entries

        Retruns:
            list of `model.FileSystem`: All public filesystem entries.
        '''
        return self.session.query(model.FileSystem)\
                .filter(model.FileSystem.group_id==None).all()

    def get_worker_and_lock(self, worker_name):
        '''Get an worker object and lock for update in database.

        Args:
            worker_name (str): Name of the worker to get.

        Returns:
            :class:`model.Worker`
        '''
        
        return self.session.query(model.Worker).with_for_update()\
            .filter(model.Worker.worker_name==worker_name).first()
    
    def get_amount_per_label(self, anno_task_id, label_leaf_id, anno_type):
        if anno_type == 'imageBased':
            sql = "SELECT COUNT(idx) FROM label WHERE label_leaf_id={} AND img_anno_id IN (SELECT idx FROM image_anno WHERE anno_task_id={})".format(label_leaf_id, anno_task_id)
            return self.session.execute(sql).first()
        else:
            sql = "SELECT COUNT(idx) FROM label WHERE label_leaf_id={} AND two_d_anno_id IN (SELECT idx FROM two_d_anno WHERE anno_task_id={})".format(label_leaf_id, anno_task_id)
            return self.session.execute(sql).first()

    def get_script_errors(self, pipe_id):
        return self.session.query(model.PipeElement).filter(model.PipeElement.pipe_id==pipe_id,\
                                                            model.PipeElement.dtype==dtype.PipeElement.SCRIPT,\
                                                            model.PipeElement.state==state.PipeElement.SCRIPT_ERROR,\
                                                            model.PipeElement.error_reported==False)
    
    def get_sia_review_first(self, anno_task_id, iteration=None):
        ''' Get next sia annotation of an anno_task
        '''
        if iteration is not None:
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.anno_task_id==anno_task_id, \
                                                           model.ImageAnno.iteration==iteration).order_by(model.ImageAnno.idx.asc()).first()
        else:
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.anno_task_id==anno_task_id).order_by(model.ImageAnno.idx.asc()).first()


    def get_sia_review_next(self, anno_task_id, img_anno_id, iteration=None):
        ''' Get next sia annotation of an anno_task
        '''
        if iteration is not None:
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.anno_task_id==anno_task_id, \
                                                        model.ImageAnno.idx > img_anno_id, \
                                                        model.ImageAnno.iteration==iteration).first()
        else:
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.anno_task_id==anno_task_id, \
                                                        model.ImageAnno.idx > img_anno_id).first()

    def get_sia_review_prev(self, anno_task_id, img_anno_id, iteration=None):
        ''' Get a previous image annotation by current annotation id
        '''
        if iteration is not None:
            sql = "SELECT * FROM image_anno WHERE iteration=%d AND anno_task_id=%d AND idx=(SELECT max(idx)\
            FROM image_anno WHERE idx<%d)"\
            %(iteration, anno_task_id, img_anno_id)
        else:
            sql = "SELECT * FROM image_anno WHERE anno_task_id=%d AND idx=(SELECT max(idx) FROM image_anno WHERE idx<%d)"\
            %(anno_task_id, img_anno_id)
        img_anno = self.session.execute(sql).first()
        if img_anno:
            return self.session.query(model.ImageAnno).filter(model.ImageAnno.idx==img_anno.idx).first()
        else:
            return None
    
    def count_two_d_annos_per_label_by_pe(self, pipe_element_id, user_id=None, iteration=None, date_from=None, date_to=None, exclude_current_iteration=False):
        user_id_str = ""
        if user_id:
            user_id_str ='AND two_d_anno.user_id = {}'.format(user_id)
        iteration_str = ""
        if iteration:
            iteration_str ='AND pipe_element.iteration = {}'.format(iteration)
            if user_id_str != "":
                iteration_str ='AND pipe_element.iteration = {}'.format(iteration)
        between_str = ""
        if date_from and date_to:
            between_str ='AND two_d_anno.timestamp BETWEEN STR_TO_DATE("{}","%Y-%m-%d") AND STR_TO_DATE("{}","%Y-%m-%d")'.format(date_from, date_to)
            if user_id_str != "" or iteration_str != "":
                between_str ='AND two_d_anno.timestamp BETWEEN STR_TO_DATE("{}","%Y-%m-%d") AND STR_TO_DATE("{}","%Y-%m-%d")'.format(date_from, date_to)

        exclude_current_iteration_str = ""
        if exclude_current_iteration:
            exclude_current_iteration_str = 'AND two_d_anno.iteration != pipe_element.iteration'

        sql = "SELECT label.label_leaf_id, label_leaf.name, COUNT(label.idx) AS num_items \
                FROM label INNER JOIN two_d_anno ON two_d_anno.idx = label.two_d_anno_id \
                INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id \
                INNER JOIN label_leaf ON label_leaf.idx = label.label_leaf_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                WHERE anno_task.pipe_element_id = {} \
                {} {} {} {} GROUP BY label.label_leaf_id".format(pipe_element_id, user_id_str, iteration_str, between_str, exclude_current_iteration_str)
        return self.session.execute(sql)
    
    def count_two_d_annos_per_day(self, pipe_element_id, user_id=None, iteration=None, date_from=None, date_to=None, exclude_current_iteration=False):
        user_id_str = ""
        if user_id:
            user_id_str ='AND two_d_anno.user_id = {}'.format(user_id)
        iteration_str = ""
        if iteration:
            iteration_str ='AND pipe_element.iteration = {}'.format(iteration)
            if user_id_str != "":
                iteration_str ='AND pipe_element.iteration = {}'.format(iteration)
        between_str = ""
        if date_from and date_to:
            between_str ='AND two_d_anno.timestamp BETWEEN STR_TO_DATE("{}","%Y-%m-%d") AND STR_TO_DATE("{}","%Y-%m-%d")'.format(date_from, date_to)
            if user_id_str != "" or iteration_str != "":
                between_str ='AND two_d_anno.timestamp BETWEEN STR_TO_DATE("{}","%Y-%m-%d") AND STR_TO_DATE("{}","%Y-%m-%d")'.format(date_from, date_to)

        exclude_current_iteration_str = ""
        if exclude_current_iteration:
            exclude_current_iteration_str = 'AND two_d_anno.iteration != pipe_element.iteration'

        sql = "SELECT COUNT(two_d_anno.idx), DAY(two_d_anno.timestamp), MONTH(two_d_anno.timestamp), YEAR(two_d_anno.timestamp) \
                FROM two_d_anno INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id\
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                WHERE anno_task.pipe_element_id = {} {} {}\
                GROUP BY YEAR(two_d_anno.timestamp), MONTH(two_d_anno.timestamp), DAY(two_d_anno.timestamp)".format(pipe_element_id, between_str, exclude_current_iteration_str)

        return self.session.execute(sql)
    
    def get_project_config(self, key=None):
        '''Get all :class:`model.Config` objects in LOST.

        Args:
            key (str): Get project config by key

        Returns:
            list: A list of :class:`model.Config` objects
            Config object: A single config object
        '''
        if key is None:
            return self.session.query(model.Config).filter(model.Config.is_user_specific==False).all()
        else:
            return self.session.query(model.Config)\
                .filter(model.Config.key == key, model.Config.is_user_specific==False).first()

    def get_number_twod_annos_in_time(self, user_id, start=None, end=None):
        if start and end:
            return self.session.query(sqlalchemy.func.count(model.TwoDAnno.idx))\
            .filter(model.TwoDAnno.user_id == user_id, \
                model.TwoDAnno.timestamp >= start, 
                model.TwoDAnno.timestamp <= end)
        else:
            return self.session.query(sqlalchemy.func.count(model.TwoDAnno.idx))\
            .filter(model.TwoDAnno.user_id == user_id)

    def count_two_d_annos_per_label_by_user(self, user_id, start=None, end=None):
        between_str = ""
        if start and end:
            between_str ='AND two_d_anno.timestamp BETWEEN STR_TO_DATE("{}","%Y-%m-%d") AND STR_TO_DATE("{}","%Y-%m-%d")'.format(start, end)

        sql = "SELECT label.label_leaf_id, label_leaf.name, label_leaf.color, COUNT(label.idx) AS num_items \
                FROM label INNER JOIN two_d_anno ON two_d_anno.idx = label.two_d_anno_id \
                INNER JOIN label_leaf ON label_leaf.idx = label.label_leaf_id \
                WHERE two_d_anno.user_id = {} \
                {} GROUP BY label.label_leaf_id".format(user_id, between_str)
        return self.session.execute(sql)
    
    def count_two_d_annos_per_type_by_user(self, user_id, start=None, end=None):
        between_str = ""
        if start and end:
            between_str ='AND two_d_anno.timestamp BETWEEN STR_TO_DATE("{}","%Y-%m-%d") AND STR_TO_DATE("{}","%Y-%m-%d")'.format(start, end)

        sql = "SELECT two_d_anno.dtype, COUNT(two_d_anno.idx) AS num_items \
                FROM two_d_anno WHERE two_d_anno.user_id = {} {} GROUP BY two_d_anno.dtype".format(user_id, between_str)
        return self.session.execute(sql)
     
    def mean_anno_time_by_user(self, user_id, anno_type='twodBased', start=None, end=None):
        between_str = ''
        if anno_type == 'imageBased':
            if start and end:
                between_str ='AND timestamp BETWEEN "{}" AND "{}"'.format(start, end)
            sql = "SELECT AVG(anno_time) FROM image_anno WHERE user_id={} AND anno_time IS NOT NULL {}".format(user_id, between_str)
            return self.session.execute(sql).first()
        else:
            if start and end:
                between_str ='AND timestamp BETWEEN "{}" AND "{}"'.format(start, end)
            sql = "SELECT AVG(anno_time) FROM two_d_anno WHERE user_id={} AND anno_time IS NOT NULL  {}".format(user_id, between_str)
            return self.session.execute(sql).first()
    
    def get_number_image_annos_in_time(self, user_id, start=None, end=None):
        if start and end:
            return self.session.query(sqlalchemy.func.count(model.ImageAnno.idx))\
            .filter(model.ImageAnno.user_id == user_id, \
                model.ImageAnno.state == state.Anno.LABELED, 
                model.ImageAnno.timestamp >= start, 
                model.ImageAnno.timestamp <= end)
        else:
            return self.session.query(sqlalchemy.func.count(model.ImageAnno.idx))\
            .filter(model.ImageAnno.user_id == user_id, \
                model.ImageAnno.state == state.Anno.LABELED)
    

    def mean_anno_time_by_user_grouped_by(self, user_id, start, end, group_by='day', anno_type='twodBased'):
        between_str ='AND timestamp BETWEEN "{}" AND "{}" GROUP BY {}(timestamp)'.format(start, end, group_by)
        if anno_type == 'imageBased':
            sql = "SELECT AVG(anno_time) FROM image_anno WHERE user_id={} AND anno_time IS NOT NULL {}".format(user_id, between_str)
            return self.session.execute(sql)
        else:
            sql = "SELECT AVG(anno_time) FROM two_d_anno WHERE user_id={} AND anno_time IS NOT NULL  {}".format(user_id, between_str)
            return self.session.execute(sql)
    

    def get_number_twod_annos_in_time_group_by(self, user_id, start, end, group_by='day'):
        between_str ='AND timestamp BETWEEN "{}" AND "{}" GROUP BY {}(timestamp)'.format(start, end, group_by)
        sql = "SELECT COUNT(idx) FROM two_d_anno WHERE user_id={} AND anno_time IS NOT NULL {}".format(user_id, between_str)
        return self.session.execute(sql)

    def get_number_image_annos_in_time_group_by(self, user_id, start, end, group_by='day'):
        between_str ='AND timestamp BETWEEN "{}" AND "{}" GROUP BY {}(timestamp)'.format(start, end, group_by)
        sql = "SELECT COUNT(idx) FROM image_anno WHERE user_id={} AND anno_time IS NOT NULL {}".format(user_id, between_str)
        return self.session.execute(sql)
    
    def get_processed_anno_tasks_in_time(self, user_id, start, end, group_by='day'):
        between_str ='AND image_anno.timestamp BETWEEN "{}" AND "{}" GROUP BY {}(image_anno.timestamp)'.format(start, end, group_by)
        sql = "SELECT COUNT(DISTINCT(anno_task.idx)) FROM image_anno INNER JOIN anno_task ON anno_task.idx = image_anno.anno_task_id WHERE \
             image_anno.user_id={} AND image_anno.anno_time IS NOT NULL {}".format(user_id, between_str)
        return self.session.execute(sql) 

    def count_all_anno_tasks_by_user(self, user_id):
        sql = "SELECT COUNT(DISTINCT(anno_task.idx)) FROM image_anno INNER JOIN anno_task ON anno_task.idx = image_anno.anno_task_id WHERE \
             image_anno.user_id={} AND image_anno.anno_time IS NOT NULL".format(user_id)
        return self.session.execute(sql) 
    
    def count_two_d_annos_by_designer_and_group_by_hour(self, user_id, start, end):
        between_str ='AND two_d_anno.timestamp BETWEEN "{}" AND "{}" \
                     GROUP BY YEAR(two_d_anno.timestamp), \
                     MONTH(two_d_anno.timestamp), DAY(two_d_anno.timestamp), \
                     HOUR(two_d_anno.timestamp)'.format(start, end)
        sql = "SELECT DAY(two_d_anno.timestamp), MONTH(two_d_anno.timestamp), \
                YEAR(two_d_anno.timestamp), HOUR(two_d_anno.timestamp), \
                COUNT(two_d_anno.idx), AVG(two_d_anno.anno_time) \
                FROM two_d_anno INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id\
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                WHERE pipe.manager_id = {} {}".format(user_id, between_str)
        return self.session.execute(sql)
    
    def get_processed_anno_tasks_in_time_by_designer(self, user_id, start, end, group_by='day'):
        between_str ='AND image_anno.timestamp BETWEEN "{}" AND "{}" GROUP BY {}(image_anno.timestamp)'.format(start, end, group_by)
        sql = "SELECT COUNT(DISTINCT(anno_task.idx)) FROM image_anno \
             INNER JOIN anno_task ON anno_task.idx = image_anno.anno_task_id \
             INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
             INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
             WHERE pipe.manager_id={} AND image_anno.anno_time IS NOT NULL {}".format(user_id, between_str)
        return self.session.execute(sql)

    def mean_anno_time_by_designer(self, user_id, anno_type='twodBased', start=None, end=None):
        between_str = ''
        if anno_type == 'imageBased':
            if start and end:
                between_str ='AND image_anno.timestamp BETWEEN "{}" AND "{}"'.format(start, end)
            sql = "SELECT AVG(image_anno.anno_time) FROM image_anno \
                INNER JOIN anno_task ON anno_task.idx = image_anno.anno_task_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                WHERE pipe.manager_id={} AND image_ano.anno_time IS NOT NULL {}".format(user_id, between_str)
            return self.session.execute(sql).first()
        else:
            if start and end:
                between_str ='AND two_d_anno.timestamp BETWEEN "{}" AND "{}"'.format(start, end)
            sql = "SELECT AVG(two_d_anno.anno_time) FROM two_d_anno \
                 INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id \
                 INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                 INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                 WHERE pipe.manager_id={} AND two_d_anno.anno_time IS NOT NULL  {}".format(user_id, between_str)
            return self.session.execute(sql).first()
    
    def mean_anno_time_by_designer_group_by(self, user_id, start, end, group_by='day', anno_type='twodBased'):
        if anno_type == 'imageBased':
            between_str ='AND image_anno.timestamp BETWEEN "{}" AND "{}" GROUP BY {}(image_anno.timestamp)'.format(start, end, group_by)
            sql = "SELECT AVG(image_anno.anno_time) FROM image_anno \
                INNER JOIN anno_task ON anno_task.idx = image_anno.anno_task_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                WHERE pipe.manager_id={} AND image_ano.anno_time IS NOT NULL {}".format(user_id, between_str)
            return self.session.execute(sql)
        else:
            between_str ='AND two_d_anno.timestamp BETWEEN "{}" AND "{}" GROUP BY {}(two_d_anno.timestamp)'.format(start, end, group_by)
            sql = "SELECT AVG(two_d_anno.anno_time) FROM two_d_anno \
                 INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id \
                 INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                 INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                 WHERE pipe.manager_id={} AND two_d_anno.anno_time IS NOT NULL  {}".format(user_id, between_str)
            return self.session.execute(sql)
    
    def count_all_anno_tasks_by_designer(self, user_id):
        sql = "SELECT COUNT(DISTINCT(anno_task.idx)) FROM image_anno \
            INNER JOIN anno_task ON anno_task.idx = image_anno.anno_task_id \
            INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
            INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
            WHERE pipe.manager_id={} AND image_anno.anno_time IS NOT NULL".format(user_id)
        return self.session.execute(sql) 
    
    def count_two_d_annos_per_label_by_designer(self, user_id, start=None, end=None):
        between_str = ""
        if start and end:
            between_str ='AND two_d_anno.timestamp BETWEEN STR_TO_DATE("{}","%Y-%m-%d") AND STR_TO_DATE("{}","%Y-%m-%d")'.format(start, end)

        sql = "SELECT label.label_leaf_id, label_leaf.name, label_leaf.color, COUNT(label.idx) AS num_items \
                FROM label INNER JOIN two_d_anno ON two_d_anno.idx = label.two_d_anno_id \
                INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                INNER JOIN label_leaf ON label_leaf.idx = label.label_leaf_id \
                WHERE pipe.manager_id = {} \
                {} GROUP BY label.label_leaf_id".format(user_id, between_str)
        return self.session.execute(sql)

    def count_two_d_annos_per_type_by_designer(self, user_id, start=None, end=None):
        between_str = ""
        if start and end:
            between_str ='AND two_d_anno.timestamp BETWEEN STR_TO_DATE("{}","%Y-%m-%d") AND STR_TO_DATE("{}","%Y-%m-%d")'.format(start, end)

        sql = "SELECT two_d_anno.dtype, COUNT(two_d_anno.idx) AS num_items \
                FROM two_d_anno INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                WHERE pipe.manager_id = {} {} GROUP BY two_d_anno.dtype".format(user_id, between_str)
        return self.session.execute(sql)

    def get_number_image_annos_in_time_by_designer_group_by(self, user_id, start, end, group_by='day'):
        between_str ='AND image_anno.timestamp BETWEEN "{}" AND "{}" GROUP BY {}(image_anno.timestamp)'.format(start, end, group_by)
        sql = "SELECT COUNT(image_anno.idx) FROM image_anno INNER JOIN anno_task ON anno_task.idx = image_anno.anno_task_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                WHERE pipe.manager_id={} AND image_anno.anno_time IS NOT NULL {}".format(user_id, between_str)
        return self.session.execute(sql)
    
        
    def get_number_image_annos_in_time_by_designer(self, user_id, start=None, end=None):
        between_str = ''
        if start and end:
            between_str ='AND image_anno.timestamp BETWEEN "{}" AND "{}"'.format(start, end)
        sql = "SELECT COUNT(image_anno.idx) FROM image_anno INNER JOIN anno_task ON anno_task.idx = image_anno.anno_task_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                WHERE pipe.manager_id={} AND image_anno.anno_time IS NOT NULL {}".format(user_id, between_str)
        return self.session.execute(sql)

    def get_number_twod_annos_in_time_by_designer_group_by(self, user_id, start, end, group_by='day'):
        between_str ='AND two_d_anno.timestamp BETWEEN "{}" AND "{}" GROUP BY {}(two_d_anno.timestamp)'.format(start, end, group_by)
        sql = "SELECT COUNT(two_d_anno.idx) FROM two_d_anno INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                WHERE pipe.manager_id={} AND two_d_anno.anno_time IS NOT NULL {}".format(user_id, between_str)
        return self.session.execute(sql)
    
    def get_number_twod_annos_in_time_by_designer(self, user_id, start=None, end=None):
        between_str = ''
        if start and end:
            between_str ='AND two_d_anno.timestamp BETWEEN "{}" AND "{}"'.format(start, end)
        sql = "SELECT COUNT(two_d_anno.idx) FROM two_d_anno INNER JOIN anno_task ON anno_task.idx = two_d_anno.anno_task_id \
                INNER JOIN pipe_element ON pipe_element.idx = anno_task.pipe_element_id \
                INNER JOIN pipe ON pipe.idx = pipe_element.pipe_id \
                WHERE pipe.manager_id={} AND two_d_anno.anno_time IS NOT NULL {}".format(user_id, between_str)
        return self.session.execute(sql)
    
    def get_anno_task_export(self, anno_task_export_id=None, anno_task_id=None):
        ''' Get anno_task_export by anno_task_export_id or anno_task_id
        '''
        if anno_task_export_id:
            return self.session.query(model.AnnoTaskExport)\
            .filter(model.AnnoTaskExport.idx==anno_task_export_id).first()
        if anno_task_id:
            return self.session.query(model.AnnoTaskExport)\
            .filter(model.AnnoTaskExport.anno_task_id==anno_task_id).order_by(model.AnnoTaskExport.idx.desc()).all()


    def count_pipelines_by_template_id(self, pipe_template_id):
        ''' Count all pipelines belonging to a template_id
        '''
        return self.session.query(sqlalchemy.func.count(model.Pipe.idx))\
        .filter(model.Pipe.pipe_template_id == pipe_template_id)