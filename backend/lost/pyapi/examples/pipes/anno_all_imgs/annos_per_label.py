from lost.pyapi import script
import os
import numpy as np
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt

def draw_diagram(store_path, labels, counts):
    fig, ax = plt.subplots()

    y_pos = np.arange(len(labels))
    ax.barh(y_pos, counts, align='center')
    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels)
    ax.invert_yaxis()  # labels read top-to-bottom
    ax.set_xlabel('Annotation count')
    ax.set_title('Number of annotations per class label')

    fig.savefig(store_path)

class AnnosPerClassLabel(script.Script):
    '''This Script counts the image annotations from the input an creates a simple diagram.
    '''
    def main(self):
        script_in = self.inp
        script_out = self.outp
        instance_path = self.instance_context

        lbl_names = dict()
        lbl_counts = dict()
        
        for anno_task in self.inp.anno_tasks:
            for lbl in anno_task.possible_labels:
                lbl_names[lbl[0]] = lbl[1]
                lbl_counts[lbl[0]] = 0

        for anno in script_in.img_annos:
            for lbl_id in anno.label_ids:
                lbl_counts[lbl_id] += 1

        vis_out_path = self.get_path("annos_per_class.svg", context='instance')
        draw_diagram(vis_out_path,
                     labels=list(lbl_names.values()),
                     counts=list(lbl_counts.values()))
        script_out.add_visual_output(img_path=vis_out_path,
                                    html='ANNOS PER CLASS')

if __name__ == "__main__":
    my_script = AnnosPerClassLabel()
