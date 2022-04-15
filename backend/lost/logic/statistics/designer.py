from datetime import date, datetime, timedelta
import flask
from lost.db.dtype import TwoDAnno


class DesignerStats():
    def __init__(self, dbm, user_id):
        self.dbm = dbm
        self.user_id = user_id
        self.today = datetime.today()  
        self.yesterday = (datetime.today() - timedelta(days=1))
        self.last_week = (datetime.today() - timedelta(days=7))
        self.last_month = (datetime.today() - timedelta(days=30))

    def get_annotation_stats(self):
        stats = dict() 
        for r in self.dbm.get_number_twod_annos_in_time_by_designer(self.user_id, start=self.yesterday, end=self.today):
            stats['today'] = r[0]
        for r in self.dbm.get_number_twod_annos_in_time_by_designer(self.user_id):
            stats['allTime'] = r[0]
        
        history_week = []
        for row in self.dbm.get_number_twod_annos_in_time_by_designer_group_by(self.user_id, start=self.last_week,end=self.today):
            history_week.append(row[0])
            
        history_month = [] 
        for row in self.dbm.get_number_twod_annos_in_time_by_designer_group_by(self.user_id, start=self.last_month,end=self.today, group_by='day'):
            history_month.append(row[0])
        stats['avg'] = '{:.2f}'.format(sum(history_week)/len(history_week))
        stats['history'] = { 
            'week':   ['{:.2f}'.format(element) for element in history_week],
            'month':   ['{:.2f}'.format(element) for element in history_month]
        }
        return stats 

    def get_annos_per_label(self):
        stats = dict()
        #for row in self.dbm.count_two_d_annos_per_label_by_user(self.user_id, start=(datetime.today() - timedelta(days=7)).strftime('%Y-%m-%d'), end=datetime.today().strftime('%Y-%m-%d')):
        for row in self.dbm.count_two_d_annos_per_label_by_designer(self.user_id):
            stats[row[1]] = {
                'value': row[3],
                'color': row[2]
            }  
        return stats

    def get_annos_per_type(self):
        stats = dict()
        for row in self.dbm.count_two_d_annos_per_type_by_designer(self.user_id):
            stats[TwoDAnno().TYPE_TO_STR[row[0]]] = row[1]
        #flask.current_app.logger.info(stats)
        return stats

    def get_anno_times(self):
        stats = dict() 
        try:
            stats['today'] = '{:.2f}'.format( self.dbm.mean_anno_time_by_designer(self.user_id, start=self.yesterday,end=self.today)[0])
        except:
            stats['today'] = '{:.2f}'.format(0)
        all_time = self.dbm.mean_anno_time_by_designer(self.user_id)[0] 
        try:
            stats['allTime'] = '{:.2f}'.format(all_time)
        except: 
            stats['allTime'] = '{:.2f}'.format(0) 
        
        history_week = []
        for row in self.dbm.mean_anno_time_by_designer_group_by(self.user_id, start=self.last_week,end=self.today):
            history_week.append(row[0])

        history_month = []
        for row in self.dbm.mean_anno_time_by_designer_group_by(self.user_id, start=self.last_month,end=self.today, group_by='day'):
            history_month.append(row[0])
        stats['avg'] = '{:.2f}'.format(sum(history_week)/len(history_week))
        stats['history'] = { 
            'week':   ['{:.2f}'.format(element) for element in history_week],
            'month':   ['{:.2f}'.format(element) for element in history_month]
        }
        return stats

    def get_annotasks(self): 
        stats = dict()
        stats['today'] = 0
        at_today = self.dbm.get_processed_anno_tasks_in_time_by_designer(self.user_id, start=self.yesterday, end=self.today)
        for row in at_today:
            stats['today'] = row[0]
        for row in self.dbm.count_all_anno_tasks_by_designer(self.user_id):
            stats['allTime'] = row[0]
    
        history_week = []
        for row in self.dbm.get_processed_anno_tasks_in_time_by_designer(self.user_id, start=self.last_week,end=self.today):
            history_week.append(row[0])
        history_month = []
        for row in self.dbm.get_processed_anno_tasks_in_time_by_designer(self.user_id, start=self.last_month,end=self.today, group_by='day'):
            history_month.append(row[0])
        stats['avg'] = '{:.2f}'.format(sum(history_week)/len(history_week))
        stats['history'] = { 
            'week':   ['{:.2f}'.format(element) for element in history_week],
            'month':   ['{:.2f}'.format(element) for element in history_month]
        }
        return stats

    def get_processed_images(self):
        stats = dict()
        for r in self.dbm.get_number_image_annos_in_time_by_designer(self.user_id, start=self.yesterday, end=self.today):
            stats['today'] = r[0]
        for r in self.dbm.get_number_image_annos_in_time_by_designer(self.user_id):
            stats['allTime'] = r[0]

        history_week = []
        for row in self.dbm.get_number_image_annos_in_time_by_designer_group_by(self.user_id, start=self.last_week,end=self.today):
            history_week.append(row[0])
            
        history_month = [] 
        for row in self.dbm.get_number_image_annos_in_time_by_designer_group_by(self.user_id, start=self.last_month,end=self.today, group_by='month'):
            history_month.append(row[0])
        stats['avg'] = '{:.2f}'.format(sum(history_week)/len(history_week))
        stats['history'] = { 
            'week':   ['{:.2f}'.format(element) for element in history_week],
            'month':   ['{:.2f}'.format(element) for element in history_month]
        }
        return stats

    def get_annos_per_hour(self):
        stats = dict()
        stats['amountPerHour'] = []
        stats['avgPerHour'] = []
        stats['totalTimePerHour'] = []
        stats['labels'] = []
        for row in self.dbm.count_two_d_annos_by_designer_and_group_by_hour(self.user_id, start=self.last_week, end=self.today):
            stats['amountPerHour'].append(row[4])
            stats['avgPerHour'].append('{:.2f}'.format(row[5]))
            stats['totalTimePerHour'].append('{:.2f}'.format(row[4]*row[5]))
            stats['labels'].append(f'{row[2]}-{row[1]}-{row[0]} {row[3]}:00')
        return stats

