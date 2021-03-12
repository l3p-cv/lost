'''A helper module to deal with blacklists.
'''
import json
import os
import lost
class ImgBlacklist(object):
    '''A class to deal with image blacklists.

    Such blacklists are often used for annotation loops, in order to 
    prevent annotating the same image multiple times.

    Attributes:
        my_script (:class:`lost.pyapi.script.Script`): The script 
            instance that creates this blacklist.
        name (str): The name of the blacklist file.
        context (str): Options: *instance*, *pipe*, *static*

    Example:
        Add images to blacklist.

        >>> blacklist = ImgBlacklist(self, name='blacklist.json')
        >>> blacklist.add(['path/to/img0.jpg'])
        >>> balcklist.save()

        Load a blacklist and check if a certain image is already in list.

        >>> blacklist = ImgBlacklist(self, name='blacklist.json')
        >>> blacklist.contains('path/to/img0.jpg')
        True
        >>> blacklist.contains('path/to/img1.jpg')
        False

        Get list of images that are not part of the blacklist

        >>> blacklist.get_whitelist(['path/to/img0.jpg', 'path/to/img1.jpg', 'path/to/img2.jpg'])
        ['path/to/img1.jpg', 'path/to/img2.jpg']

        Add images to the blacklist

        >>> blacklist.add(['path/to/img1.jpg', 'path/to/img2.jpg'])
    '''
    def __init__(self, my_script, name='img-blacklist.json', context='pipe'):
        self.my_script = my_script #type: lost.pyapi.script.Script
        self.name = name
        self.context = context
        self.blacklist = set()
        self.path = self.my_script.get_path(self.name, context=self.context)
        self._load()
    
    def _load(self):
        '''Read blacklist from filesystem'''
        if os.path.exists(self.path):
            with open(self.path) as json_file:
                self.blacklist = set(json.load(json_file))
            # self.my_script.logger.info('Loaded blacklist from: {}'.format(self.path))

    def save(self):
        '''Write blacklist to filesystem'''
        with open(self.path, 'w') as outfile:
            json.dump(list(self.blacklist), outfile)

    def add(self, imgs):
        '''Add a list of images to blacklist.

        Args:
            imgs (list): A list of image identifiers that should be added
                to the blacklist.
        '''
        if type(imgs) != list and type(imgs) != set:
            self.my_script.logger.warning('Lists should be used as argument for add method! Not {}'.format(type(imgs)))
        self.blacklist.update(imgs)

    def contains(self, img):
        '''Check if blacklist contains a spcific image
        
        Args:
            img (str): The image identifier
        
        Returns:
            bool: True if **img** in blacklist, False if not.
        '''
        return img in self.blacklist

    def delete_blacklist(self):
        '''Remove blacklist from filesystem'''
        os.remove(self.path)

    def remove_item(self, item):
        '''Remove item from blacklist
        
        Args:
            item (str): The item/ image to remove from blacklist.
        '''
        try:
            self.blacklist.remove(item)
        except KeyError:
            self.my_script.logger.warning('Tried to remove item from blacklist, but {} is not present in blacklist'.format(item))
    
    def get_whitelist(self, img_list, n='all'):
        '''Get a list of images that are not part of the blacklist.

        Args:
            img_list (list of str): A list of images where should be 
                checked if they are in the blacklist 
            n ('all' or 'int'): The maximum number of images that should
                be returned.
        
        Returns:
            list of str: A list of images that are not in the blacklist.

        '''
        new = set(img_list) - self.blacklist
        if n == 'all':
            return list(new)
        else:
            if len(new) < n:
                return list(new)
            else:
                new_list = list(new)[:n]
                return new_list
