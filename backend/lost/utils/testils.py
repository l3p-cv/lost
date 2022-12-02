'''Helper function for testing'''

from lost.db import model, dtype
from lost.logic.label import LabelTree
import datetime
import pandas as pd
import json
from lost.logic.pipeline.instance import PipeInstance

def get_user(dbm):
    email = 'test@example.com'
    user = None
    for u in dbm.get_users():
        if u.email == email:
            user = u
            break
    if user is None:
        user = model.User(
                user_name = 'test',
                email=email,
                email_confirmed_at=datetime.datetime.utcnow(),
                password='test',
                first_name= 'Test',
                last_name='User'
            )
        dbm.save_obj(user)
        g = model.Group(name=user.user_name, is_user_default=True)
        dbm.save_obj(g)
        ug = model.UserGroups(group_id=g.idx,user_id=user.idx)
        dbm.save_obj(ug)

        fs = model.FileSystem(group_id=g.idx, connection=json.dumps(dict()), 
                                user_default_id=user.idx,
                                root_path='/home/lost/data/test',
                                fs_type='file', timestamp=datetime.datetime.now(), 
                                name=user.user_name)
        dbm.add(fs)
        dbm.commit()
    return user

def delete_user(dbm, user):
    for g in user.groups:
        if g.is_user_default:
            dbm.delete(g)
    dbm.delete(user)
    dbm.commit()

def get_voc_label_tree(dbm):
    tree = LabelTree(dbm)
    df = pd.read_csv('/code/src/backend/lost/pyapi/examples/label_trees/pascal_voc2012.csv')
    root = tree.import_df(df)
    if root is None:
        name = df[df['parent_leaf_id'].isnull()]['name'].values[0]
        tree = LabelTree(dbm, name=name)
    return tree

def create_required_label_leaves(anno_task_id, label_leaf_id):
    required_label_leaf = model.RequiredLabelLeaf()
    required_label_leaf.anno_task_id = anno_task_id
    required_label_leaf.label_leaf_id = label_leaf_id
    required_label_leaf.max_labels = 3
    return required_label_leaf

def get_script_pipeline_fragment(dbm):
    '''Get a fragment of a pipeline

    Script -> AnnoTask:
        A Script connected to an AnnoTask

    Returns:
        :class:`lost.db.model.PipeElement`, :class:`lost.db.model.PipeElement`, :class:`lost.db.model.Pipe`: 
            (script_element, annotation_task_element, pipeline)
    '''
    test_user = get_user(dbm)
    pipe = model.Pipe(name='TestPipe', manager_id=test_user.idx)
    dbm.add(pipe)
    dbm.commit()

    script = model.Script(name='TestScript', path='data/pipes/test/test.py')
    dbm.add(script)
    dbm.commit()

    pe_s = model.PipeElement(pipe_id=pipe.idx, dtype=dtype.PipeElement.SCRIPT)
    pe_s.script = script
    dbm.add(pe_s)
    dbm.commit()

    script_result = model.Result()
    dbm.add(script_result)
    dbm.commit()
    
    anno_task = model.AnnoTask(name='TestAnnoTask')
    dbm.add(anno_task)

    pe_a = model.PipeElement(pipe_id=pipe.idx, dtype=dtype.PipeElement.ANNO_TASK)
    pe_a.anno_task = anno_task
    # pe_a.result_in.append(script_result)
    # pe_a.result_out.append(script_result)
    dbm.add(pe_a)
    dbm.commit()

    tree = get_voc_label_tree(dbm)
    required_label_leaf = create_required_label_leaves(anno_task.idx, tree.root.idx)
    dbm.add(required_label_leaf)
    dbm.commit()

    # pe_s.pe_outs.append(pe_a)
    # dbm.commit()

    # Link elements
    res_link_s = model.ResultLink(result_id=script_result.idx, 
        pe_n=pe_s.idx, pe_out=pe_a.idx
    )
    res_link_a = model.ResultLink(result_id=script_result.idx, 
        pe_n=pe_a.idx, pe_out=None
    )
    dbm.add(res_link_s)
    dbm.add(res_link_a)
    dbm.commit()

    return pe_s, pe_a, pipe

def delete_script_pipeline_fragment(dbm, pipe):
    '''Delete a fragment of a pipeline

    Script -> AnnoTask:
        A Script connected to an AnnoTask
    '''
    # pi = PipeInstance(dbm, pipe)
    # pi.delete_pipeline()
    print('We should implement a working clean up here!')