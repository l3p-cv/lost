from datetime import datetime, timedelta

class Report():
    def __init__(self, dbm, data):
        self.now = datetime.now()
        self.today = self.now.strftime('%Y-%m-%d')
        self.dbm = dbm
        self.report_type = data['reportType']
        self.pe_id = data['peId']
        self.date_from = None
        if 'dateFrom' in data:
            self.date_from = data['dateFrom']
        self.date_to = self.today
        if 'dateTo' in data:
            self.date_to = data['dateTo']
        self.anno_type = None
        if 'annoType' in data:
            self.anno_type = data['annoType']
        self.user_id = None
        if 'userId' in data:
            self.user_id = data['userId']
        self.iteration = None
        if 'iteration' in data:
            self.iteration = data['iteration']
    
    def get_report(self):
        report = dict()
        data = []
        labels = []
        if self.report_type == 'annosPerLabel':
            data, labels = self.__get_annos_per_label()
        elif self.report_type == 'annosPerDay':
            data, labels = self.__get_annos_per_day()
        #labels.append(self.today)
        report['labels'] = labels
        report['data'] = data
        return report

    def __get_annos_per_label(self):
        data = []
        labels = []
        two_d_anno_counts = self.dbm.count_two_d_annos_per_label_by_pe(self.pe_id, self.user_id, self.iteration, self.date_from, self.date_to, exclude_current_iteration=True)
        for row in two_d_anno_counts:
            data.append(row[2])
            labels.append(row[1])
        return data, labels 

    def __get_annos_per_day(self):
        data = [] 
        labels = []
        two_d_anno_counts = self.dbm.count_two_d_annos_per_day(self.pe_id, self.user_id, self.iteration, self.date_from, self.date_to, exclude_current_iteration=True)
        for row in two_d_anno_counts:
            data.append(row[0])
            labels.append('{}-{}-{}'.format(row[3], row[2], row[1]))
        return data, labels