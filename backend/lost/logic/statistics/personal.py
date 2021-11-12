from datetime import datetime, timedelta
import flask
from lost.db.dtype import TwoDAnno

def get_annotation_stats(dbm, user_id):
    stats = dict()
    for r in dbm.get_number_twod_annos_in_time(user_id, start=(datetime.today() - timedelta(days=1)), end=datetime.today())[0]:
        stats['today'] = r
    for r in dbm.get_number_twod_annos_in_time(user_id)[0]:
        stats['allTime'] = r
    stats['avg'] = '2003'
    stats['history'] = {
            'week': [37,36,35,34,33,32,31],
            # 'month': [40,39,38,37,36,35,34,33,32,31,40,39,38,37,36,35,34,33,32,31,40,39,38,37,36,35,34,33,32,31]
        }    
    return stats

def get_annos_per_label(dbm, user_id):
    stats = dict()
    #for row in dbm.count_two_d_annos_per_label_by_user(user_id, start=(datetime.today() - timedelta(days=7)).strftime('%Y-%m-%d'), end=datetime.today().strftime('%Y-%m-%d')):
    for row in dbm.count_two_d_annos_per_label_by_user(user_id):
        stats[row[1]] = {
            'value': row[3],
            'color': row[2]
        }  
    return stats

def get_annos_per_type(dbm, user_id):
    stats = dict()
    for row in dbm.count_two_d_annos_per_type_by_user(user_id):
        stats[TwoDAnno().TYPE_TO_STR[row[0]]] = row[1]
    #flask.current_app.logger.info(stats)
    return stats

def get_anno_times(dbm, user_id):
    stats = dict()  
    stats['today'] = '51'
    stats['allTime'] = '5001'
    stats['avg'] = '{:.2f}'.format(dbm.mean_anno_time_by_user(user_id)[0])
    stats['history'] = { 
        'week': [34,33,32,37,36,35,31],
        'month': [40,39,38,37,36,35,34,33,32,31,40,39,38,37,36,35,34,33,32,31,40,39,38,37,36,35,34,33,32,31]
    }
    return stats