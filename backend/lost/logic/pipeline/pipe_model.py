__author__ = 'Jonas Jaeger'
from lost.db import model, access, state, dtype
from datetime import datetime
import igraph

class PipeEngine(object):
    '''A PipeEngine object maps to one pipeline in the portal an manages it.

    Each pipline belongs to one Pipe.
    '''
    def __init__(self, dbm, pipe):
        self.dbm = dbm
        self.pipe = pipe#dbm.get_task(task_id)
        self.pipe_elements = dbm.get_pipe_elements(pipe.idx)
        self.pe_graph = self.create_pe_graph(self.pipe_elements)

    def create_pe_graph(self, pe_list):
        '''Create a graph for a pipeline.

        Args:
            pe_list (list): A list of pipeline elements that represent a pipeline.

        Returns:
            Graph: A graph of :class:`lost.db.model.PipeElement` objects.
                pe_graph.vs[0] is source and pe_graph.vs[pe_graph.vcount()-1]
                is sink.
        '''
        pe_graph = igraph.Graph(directed=True)
        pe_graph.add_vertices(len(pe_list)+2)
        new_vs = pe_graph.vs.select(range(1,len(pe_list)+1))
        new_vs["pe"] = pe_list
        new_vs["visited"] = False
        sink = pe_graph.vs[pe_graph.vcount()-1]
        sink["visited"] = False
        pe_graph.vs[0]["visited"] = True
        for pe in pe_list:
            v_pe_n = pe_graph.vs.select(pe_eq=pe)[0]
            if pe.state == state.PipeElement.FINISHED:
                v_pe_n["visited"] = True
            # Link PipeElements
            for pe_out in pe.pe_outs:
                v_pe_out = pe_graph.vs.select(pe_eq=pe_out)[0]
                pe_graph.add_edge(v_pe_n.index, v_pe_out.index)
            # Check if pe should be linked to sink
            if len(pe.pe_outs) == 0:
                pe_graph.add_edge(v_pe_n.index, sink.index)
        for pe in pe_list:
            #Check if pe should be linked to source
            v_pe_n = pe_graph.vs.select(pe_eq=pe)[0]
            target = pe_graph.es.select(_target=v_pe_n.index)
            if len(target) == 0:
                pe_graph.add_edge(0, v_pe_n.index)
        return pe_graph

    def get_all_loop_elements(self):
        '''Get all loop elements in pipeline.

        Returns:
            list: of PipeElements
        '''
        loop_list = list()
        for pipe_e in self.pipe_elements:
            if pipe_e.dtype == dtype.PipeElement.LOOP:
                loop_list.append(pipe_e)
        return loop_list

    def get_loop_pes(self, pe_jump, pe_loop):
        '''Get all pipeline elements that are within a loop.

        Args:
            pe_jump: The element where the loop starts.
            pe_loop: The loop element.

        Returns:
            list: A list of PipeElements
        '''
        #v_jump = self.pe_graph.vs.select(pe_eq=pe_jump)[0]
        #v_loop = self.pe_graph.vs.select(pe_eq=pe_loop)[0]
        #self.pe_graph.es['cost'] = 0
        #loop_vs = list()
        #while True:
        #    vpath = self.pe_graph.get_shortest_paths(v_jump.index, v_loop.index,
        #                                            'cost')[0]
        #    epath = self.pe_graph.get_shortest_paths(v_jump.index, v_loop.index,
        #                                            'cost', output='epath')[0]
        #    self.pe_graph.es[epath]['cost'] = 1
        #    if vpath in loop_vs:
        #        break
        #    loop_vs.append(vpath)
        #vset = set()
        #for vpath in loop_vs:
        #    vset = vset | set(vpath)
        ##Clean up in order to prevent side effects
        #self.pe_graph.es['cost'] = 0
        #return self.pe_graph.vs[vset]['pe']
        
        #Get all vs between v_jump and v_loop including v_jump and v_loop.
        v_jump = self.pe_graph.vs.select(pe_eq=pe_jump)[0]
        v_loop = self.pe_graph.vs.select(pe_eq=pe_loop)[0]
        s = set(self.pe_graph.subcomponent(v_jump.index, mode='out'))
        t = set(self.pe_graph.subcomponent(v_loop.index, mode='in'))
        intersec = s.intersection(t)
        return self.pe_graph.vs[intersec]['pe']

    def get_next_loop(self, pe):
        '''Get the nearest loop element relative to pe

        Args:
            pe (PipeElement): A PipeElement that wants to know the next loop element.

        Returns:
            PipeElement or None: The next loop element in pipeline. When no
                loop element can be found, None will be returned.
        '''
        v_pe = self.pe_graph.vs.select(pe_eq=pe)[0]
        min_path = None
        min_loop_e = None
        loop_e = None
        for loop_e in self.get_all_loop_elements():
            v_loop = self.pe_graph.vs.select(pe_eq=loop_e)[0]
            # TODO:We just need the distance in between two elements in the graph
            # to select the closest loop. I think there is a better method than
            # shortest path.
            path_new = self.pe_graph.get_shortest_paths(v_pe.index, v_loop.index)[0]
            if min_path is None:
                min_path = path_new
                min_loop_e = loop_e
            elif len(path_new) < len(min_path):
                min_path = path_new
                min_loop_e = loop_e
        return loop_e

    def get_to_visit(self):
        '''Get all pipe elements that should be visited.

        Returns:
            list: A list of :class:`lost.db.model.PipeElement` objects.
        '''
        return self.pe_graph.vs.select(visited_eq=False)["pe"]

    def get_prev_pes(self, pe):
        '''Get previous :class:`lost.db.model.PipeElement` objects in the pipeline.

        Args:
            pe (object): Current :class:`lost.db.model.PipeElement`

        Returns:
            list: A list of :class:`lost.db.model.PipeElement` objects.
        '''
        v_pe = self.pe_graph.vs.select(pe_eq=pe)[0]
        return self.get_prev_vertices(v_pe.index)["pe"]

    def get_prev_vertices(self, vertex_id):
        '''Get previous vertices in pe_graph with respect to vertex_id.

        Args:
            vertex_id (int): Index of a vertx in pe_graph

        Returns:
            VertexSeq: A sequence of previous vertices.
        '''
        prev_v_list = list()
        target = self.pe_graph.es.select(_target=vertex_id)
        for edge in target:
            prev_v_list.append(edge.source)
        return self.pe_graph.vs[prev_v_list]

    def get_next_vertices(self, vertex_id):
        '''Get next vertices in pe_graph with respect to vertex_id.

        Args:
            vertex_id (int): Index of a vertx in pe_graph

        Returns:
            VertexSeq: A sequence of next vertices.
        '''
        prev_v_list = list()
        source = self.pe_graph.es.select(_source=vertex_id)
        for edge in source:
            prev_v_list.append(edge.target)
        return self.pe_graph.vs[prev_v_list]

    def get_next_pes(self, pe):
        '''Get next :class:`lost.db.model.PipeElement` objects in the pipeline.

        Args:
            pe (object): Current :class:`lost.db.model.PipeElement`

        Returns:
            list: A list of :class:`lost.db.model.PipeElement` objects.
        '''
        v_pe = self.pe_graph.vs.select(pe_eq=pe)[0]
        return self.get_next_vertices(v_pe.index)["pe"]

    # def get_all_paths(self):
    #     '''Get all paths through the pipeline.
    #
    #     Returns:
    #         list: [[path1], [path2],...] where path1 is a list of
    #             :class:`lost.db.model.PipeElement` objects.
    #     '''
    #     pe_paths = list()
    #     g = self.pe_graph
    #     v_paths = g.get_all_shortest_paths(0, g.vcount()-1)
    #     for v_path in v_paths:
    #         pe_paths.append(g.vs[v_path]["pe"])
    #     return pe_paths

    def get_final_pes(self):
        '''Get last :class:`lost.db.model.PipeElement` objects in pipeline

        Returns:
            list: A list of :class:`lost.db.model.PipeElement` objects.
        '''
        return self.get_prev_vertices(self.pe_graph.vcount()-1)["pe"]

    def set_visited(self, pe):
        v_pe = self.pe_graph.vs.select(pe_eq=pe)[0]
        v_pe["visited"] = True

    def set_to_visit(self, pe):
        v_pe = self.pe_graph.vs.select(pe_eq=pe)[0]
        v_pe["visited"] = False
