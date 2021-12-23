import ast
from lost.db import model
from datetime import datetime
import pandas as pd
import json
import time


def try_dump(data):
    if data is None:
        return None
    if type(data) != str:
        try:
            return json.dumps(data)
        except:
            return None
    return data


class ProjectConfigMan(object):

    def __init__(self, dbm):
        self.dbm = dbm
        self.df = self._load_from_db()

    def _load_from_db(self):
        d_list = [c.to_dict() for c in self.dbm.get_project_config()]
        return pd.DataFrame(d_list)

    def _get_by_key(self, key, entry):
        '''Get entry for a specific key'''
        try:
            return ast.literal_eval(self.df[self.df['key'] == key][entry].values[0])
        except:
            try:
                return self.df[self.df['key'] == key][entry].values[0]
            except:
                raise KeyError('Wrong key: {}'.format(key))

    def get_all(self):
        '''
        Returns: config file as json
        '''
        return json.loads(self.df.to_json(orient='records'))

    def get_val(self, key):
        '''Get config value for a specific key.

        Args:
            key (str): Config key

        Retruns:
            python object
        '''
        return self._get_by_key(key, 'value')

    def get_default_val(self, key):
        '''Get config default_value for a specific key.

        Args:
            key (str): Config key

        Retruns:
            python object
        '''
        return self._get_by_key(key, 'default_value')

    def get_description(self, key):
        '''Get config description for a specific key.

        Args:
            key (str): Config key

        Retruns:
            str: Description for this config entry.
        '''
        return self._get_by_key(key, 'description')

    def update_all(self, new_values):
        '''Update all entrys

        Args: 
            new_values: new values
        '''
        return "Not implemented"

    def update_entry(self, key, value=None, user_id=None, default=None, description=None, config=None):
        '''Update config entry.

        Args:
            key (str): Config key
            value (None or obj): Value for the config entry
            user_id (None or int): Id of user who created this entry
            default (None or obj): Default value for this config entry
            description (None or str): Description for this config entry
        '''
        entry = self.dbm.get_project_config(key)
        if entry is None:
            raise Exception('No entry in database for key: {}!'.format(key))
        else:
            if value is not None:
                entry.value = try_dump(value)
            if user_id is not None:
                entry.user_id = user_id
            if default is not None:
                entry.default_value = try_dump(default)
            if description is not None:
                entry.description = description
            if config is not None:
                entry.conifg = config
            self.dbm.save_obj(entry)

    def create_entry(self, key, value, user_id=None, default=None, description=None, config=None):
        '''Create config entry.

        Args:
            key (str): Config key
            value (obj): Value for the config entry
            user_id (None or int): Id of user who created this entry
            default (None or obj): Default value for this config entry
            description (None or str): Description for this config entry

        Note:
            Will throw exception if key is already present in config!
        '''
        entry = self.dbm.get_project_config(key)
        if entry is None:
            if default is None:
                default = value
            entry = model.Config(key=key, default_value=try_dump(default), value=try_dump(value),
                                 user_id=user_id, timestamp=int(time.time()), description=description, config=config
                                 )
            self.dbm.save_obj(entry)
        else:
            raise Exception(
                'Config entry already exists! Can not create key: {}!'.format(key))
