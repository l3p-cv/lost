import pandas as pd

from lost.db import model
import numpy as np
import hashlib
from skimage import color as skcolor

__author__ = "Jonas Jaeger"

DEFAULT_LABEL_COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFA94D",
    "#845EF7",
    "#69DB7C",
    "#F06595",
    "#FFD43B",
]

class LabelTree:
    """A class that represants a LabelTree.

    Args:
        dbm (:class:`lost.db.access.DBMan`): Database manager object.
        root_id (int): label_leaf_id of the root Leaf.
        root_leaf (:class:`lost.db.model.LabelLeaf`): Root leaf of the tree.
        name (str): Name of a label tree.
        logger (logger): A logger.
        group_id (int): Id of the group where the LabelTree belongs to.
    """

    def __init__(self, dbm, root_id=None, root_leaf=None, name=None, logger=None, group_id=None):
        self.dbm = dbm  # type: lost.db.access.DBMan
        self.root = None  # type: lost.db.model.LabelLeaf
        self.group_id = group_id
        self.tree = {}
        self._color_cursor = 0 
        if logger is None:
            import logging

            self.logger = logging
        else:
            self.logger = logger
        if root_leaf is not None:
            self.root = root_leaf
            self.__collect_tree(self.root, self.tree)
        elif root_id is not None:
            self.root = self.dbm.get_label_leaf(root_id)
            self.__collect_tree(self.root, self.tree)
        elif name is not None:
            if group_id is None:
                root_list = self.dbm.get_all_label_trees(global_only=True)
            else:
                root_list = self.dbm.get_all_label_trees(group_id=group_id, add_global=True)
            for leaf in root_list:
                print(leaf.name)
            root = next(filter(lambda x: x.name == name, root_list), None)
            if root is None:
                raise Exception(f'LabelTree with name "{name}" not found in database!')
            else:
                self.root = root
                self.__collect_tree(self.root, self.tree)

    def __collect_tree(self, label_leaf, leaf_map):
        """Collect all LabelLeafs from Tree or Subtree

        Args:
            label_leaf (:class:`lost.db.model.LabelLeaf`): The leaf to start leaf collection.
            leaf_map (dict): Dictionary that maps leaf ids to LabelLeaf objects
                {leaf_id : LabelLeaf}
        """
        leaf_map[label_leaf.idx] = label_leaf
        for ll in label_leaf.label_leaves:
            self.__collect_tree(ll, leaf_map)

    def delete_subtree(self, leaf):
        """Recursive delete all leafs in subtree starting with leaf

        Args:
            leaf (:class:`lost.db.model.LabelLeaf`): Delete all childs
                of this leaf. The leaf itself stays.
        """
        for ll in leaf.label_leaves:
            self.delete_subtree(ll)
            self.logger.info(f"Deleting label leaf: {ll.name}")
            self.dbm.delete(ll)

    def delete_tree(self):
        """Delete whole tree from system"""
        self.delete_subtree(self.root)
        self.dbm.delete(self.root)
        self.dbm.commit()

    def create_root(self, name, external_id=None):
        """Create the root of a label tree.

        Args:
            name (str): Name of the root leaf.
            external_id (str): Some id of an external label system.

        Retruns:
            :class:`lost.db.model.LabelLeaf` or None:
                The created root leaf or None if a root leaf with same
                name is already present in database.
        """
        root_leafs = self.dbm.get_all_label_trees(global_only=True)
        if root_leafs is not None:
            for leaf in root_leafs:
                if name == leaf.name:
                    return None
        self.root = model.LabelLeaf(name=name, external_id=external_id, is_root=True)
        self.dbm.add(self.root)
        self.dbm.commit()
        self.tree[self.root.idx] = self.root
        self.logger.info(f"Created root leaf: {name}")
        return self.root

    def create_child(self, parent_id, name, external_id=None):
        """Create a new leaf in label tree.

        Args:
            parent_id (int): Id of the parend leaf.
            name (str): Name of the leaf e.g the class name.
            external_id (str): Some id of an external label system.

        Retruns:
            :class:`lost.db.model.LabelLeaf`: The the created child leaf.
        """
        leaf = model.LabelLeaf(name=name, external_id=external_id, parent_leaf_id=parent_id)
        self.dbm.add(leaf)
        self.dbm.commit()
        self.tree[leaf.idx] = leaf
        self.logger.info(f"Created child leaf: {name}")
        return leaf


    def assign_import_color(self, name):
        if not hasattr(self, "_colors"):
            self._colors = {}
            self._used = []

            # cache default colors in RGB so we can avoid them
            self._default_rgb = [
                np.array([int(c[i:i+2], 16) / 255 for i in (1, 3, 5)])
                for c in DEFAULT_LABEL_COLORS
            ]

        if name in self._colors:
            return self._colors[name]

        # deterministic seed per name
        h = hashlib.md5(name.encode()).digest()
        seed = int.from_bytes(h[:4], "big")
        rng = np.random.default_rng(seed)

        best_rgb = None
        best_score = -1

        # combine already used + default palette (avoid both)
        ref_colors = self._used + self._default_rgb

        for _ in range(40):
            # sample in Lab space (better perceptual control)
            lab = np.array([
                rng.uniform(55, 85),     # lightness (avoid extremes)
                rng.uniform(-60, 60),    # a axis
                rng.uniform(-60, 60)     # b axis
            ])

            rgb = skcolor.lab2rgb(lab.reshape(1, 1, 3))[0][0]
            rgb = np.clip(rgb, 0, 1)

            # perceptual separation score (simple but effective)
            if ref_colors:
                min_dist = min(np.linalg.norm(rgb - c) for c in ref_colors)
            else:
                min_dist = 999

            # maximize distance from ALL existing + default colors
            if min_dist > best_score:
                best_score = min_dist
                best_rgb = rgb

        self._used.append(best_rgb)

        hex_color = '#%02x%02x%02x' % tuple((best_rgb * 255).astype(int))
        self._colors[name] = hex_color

        return hex_color

    def get_child_vec(self, parent_id, columns="idx"):
        """Get a vector of child labels.

        Args:
            parent_id (int): Id of the parent leaf.
            columns (str or list of str): Can be any attribute of :class:`lost.db.model.LabelLeaf`
                for example 'idx', 'external_idx', 'name' or a list of these e.g.
                ['name', 'idx']

        Example:
            >>> label_tree.get_child_vec(1, columns='idx')
            [2, 3, 4]

            >>> label_tree.get_child_vec(1, columns=['idx', 'name'])
            [
                [2, 'cow'],
                [3, 'horse'],
                [4, 'person']
            ]

        Returns:
            list in the requested columns:
        """
        parent = self.tree[parent_id]  # type: lost.db.model.LabelLeaf
        df_list = []
        for ll in parent.label_leaves:
            df_list.append(ll.to_df()[columns])
        df = pd.concat(df_list)
        return df.values.tolist()

    def to_df(self):
        """Transform this LabelTree to a pandas DataFrame.

        Returns:
            pandas.DataFrame
        """
        df_list = []
        for leaf_id, leaf in self.tree.items():
            df_list.append(leaf.to_df())
        df = pd.concat(df_list)
        return df.reset_index().drop(columns=["index"])

    # def to_list(self):
    #     leaves = list()
    #     for leaf_id, leaf in self.tree.items():
    #         leaves.append(leaf.to_dict())
    #     return leaves

    def __collect_dict_tree(self, label_leaf, t_dict):
        t_dict["children"] = []
        for ll in label_leaf.label_leaves:
            ll_dict = ll.to_dict()
            t_dict["children"].append(ll_dict)
            self.__collect_dict_tree(ll, ll_dict)

    def to_hierarchical_dict(self):
        my_dict = self.root.to_dict()
        self.__collect_dict_tree(self.root, my_dict)
        return my_dict

    def _df_row_to_leaf(self, row, leaf):
        """Transfrom LabelLeaf in row style to a LabelLeaf object.

        Args:
            row (pandas.Series): A LabelLeaf in row style.

        Returns:
            :class:`lost.db.model.LabelLeaf`:
                The transformed row.
        """
        try:
            leaf.abbreviation = row["abbreviation"] if pd.notna(row["abbreviation"]) else ""
            self.logger.info(f"\tabbreviation: {leaf.abbreviation}")
        except KeyError:
            self.logger.info("\tNo abbreviation provided.")

        try:
            leaf.description = row["description"] if pd.notna(row["description"]) else ""
            self.logger.info(f"\tdescription: {leaf.description}")
        except KeyError:
            self.logger.info("\tNo description provided.")

        try:
            leaf.timestamp = row["timestamp"] if pd.notna(row["timestamp"]) else None
            self.logger.info(f"\ttimestamp: {leaf.timestamp}")
        except KeyError:
            self.logger.info("\tNo timestamp provided.")

        try:
            leaf.external_id = int(row["external_id"]) if pd.notna(row["external_id"]) else None
            self.logger.info(f"\texternal_id: {leaf.external_id}")
        except KeyError:
            self.logger.info("\tNo external_id provided.")

        try:
            leaf.is_deleted = bool(row["is_deleted"]) if pd.notna(row["is_deleted"]) else False
            self.logger.info(f"\tis_deleted: {leaf.is_deleted}")
        except KeyError:
            self.logger.info("\tNo is_deleted provided.")

        try:
            raw_color = row.get("color", None)

            invalid_colors = ["", "None", "none", "#ffffff", "#46aed7"]

            if pd.isna(raw_color) or str(raw_color).strip().lower() in invalid_colors:
                name = row.get("name", None)
                if name:
                    leaf.color = self.assign_import_color(str(name))
                else:
                    leaf.color = DEFAULT_LABEL_COLORS[0]
            else:
                leaf.color = raw_color

            self.logger.info(f"\tcolor: {leaf.color}")
        except KeyError:
            self.logger.info("\tNo color provided.")

        leaf.group_id = self.group_id

    def __create_childs_from_df(self, child_dict, parent, parent_row):
        """Create child leafs from a df.

        Args:
            child_dict (dict): A dictionary that maps parent_ids from DataFrame
                to child rows from DataFrame.
            parent (:class:`lost.db.model.LabelLeaf`): A parent LabelLeaf
                that was already imported.
            parent_row (pandas.Series): A row from the DataFrame to import.
        """
        if parent_row["idx"] not in child_dict:
            return
        for child_row in child_dict[parent_row["idx"]]:
            child = self.create_child(parent.idx, child_row["name"])
            self._df_row_to_leaf(child_row, child)
            self.__create_childs_from_df(child_dict, child, child_row)

    def import_df(self, df):
        """Import LabelTree from DataFrame

        Args:
            df (pandas.DataFrame): LabelTree in DataFrame style.

        Retruns:
            :class:`lost.db.model.LabelLeaf` or None:
                The created root leaf or None if a root leaf with same
                name is already present in database.
        """
        df = df.where((pd.notnull(df)), None)
        root = df[df["parent_leaf_id"].isnull()]
        no_root = df[~df["parent_leaf_id"].isnull()]
        childs = {}

        if len(root) != 1:
            raise ValueError(f"""Can not import. There needs 
                to be exactly one root leaf for that tree! 
                Found: \n{root}""")
        else:
            try:
                root_leaf = self.create_root(root["name"].values[0])
                if root_leaf is None:
                    return None  # A tree with the same name already exists.
                self._df_row_to_leaf(root.loc[0], root_leaf)

                # Create child dict
                for index, row in no_root.iterrows():
                    if row["parent_leaf_id"] not in childs:
                        childs[row["parent_leaf_id"]] = []
                    childs[row["parent_leaf_id"]].append(row)

                self.__create_childs_from_df(childs, root_leaf, root.loc[0])
                self.dbm.commit()
                return root_leaf
            except KeyError:
                self.logger.error("""At least the following columns 
                    need to be provided: *idx*, *name*, *parent_leaf_id*""")
                raise
