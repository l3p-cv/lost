import matplotlib.pyplot as plt
import matplotlib.patches as patches
import skimage.io
import numpy as np


def boxes(script, img_anno, figsize=(15,15), fontsize=15, label_offset=(0,15)):
    '''Draw bboxes on into an matplotlib figures

    Args:
        script (lost.pyapi.script.Script): The script object that uses this method.
        img_anno (lost.pyapi.annos.ImageAnno): The image anno where bboxes 
            should be visualized for.
        figsize (tuple): Size of the matplotlib figure
        fontsize (ing): Fontsize in pixels for label display
        label_offset (tuple): Position of the label in pixels in relation to 
            the upper left corner of the box.
    
    Returns:
        Matplotlib figure
    '''
    lbls = img_anno.bbox_lbl_names_vec
    return _boxes(script.get_abs_path(img_anno.img_path), 
        img_anno.bbox_vec, 
        lbls,
        figsize=figsize,
        fontsize=fontsize,
        label_offset=label_offset)

def _boxes(img, bb_list, lbls=None, figsize=(15,15), fontsize=15, label_offset=(0, 15)):
    '''Draw bboxes on into an matplotlib figures

    Args:
        img (str or array): Path to an image file or an image as numpy rgb array.
        bb_list (list): List of bboxes in format,
            [
                [xc, yc, width, height],
                [...]
            ]
            Values are considered to be relative.
        lbls (list): List of labels corresponding to bb_list
        figsize (tuple): Size of the matplotlib figure.

    Returns:
        Matplotlib figure
    '''
    fig,ax = plt.subplots(1, figsize=figsize)
    if isinstance(img, str):
        img = skimage.io.imread(img)
    ax.imshow(img)
    for idx, bb in enumerate(bb_list):
        if not np.isnan(bb[0]):
            w = bb[2] * img.shape[1]
            h = bb[3] * img.shape[0]
            x = bb[0] * img.shape[1] - w/2.0
            y = bb[1] *img.shape[0] - h/2.0
            bbox = patches.Rectangle((x,y),w,h,linewidth=2,edgecolor='r',facecolor='none')
            ax.add_patch(bbox)
            if lbls is not None:
                try:
                    if lbls[idx] is not None:
                        ax.text(x-label_offset[0], y-label_offset[1], lbls[idx], color='r', fontsize=fontsize)
                except IndexError:
                    pass
    fig.tight_layout()
    return fig

def vis_tracks(img, tracks, frame_n, dots=15, figsize=(10,10), dot_radius=5, linewidth=2):
    '''Visualize a track on image
    
    Args:
        img (array or str): An RGB image or path to the image file.
        tracks (array): [[frame_n, track_id, xc, yc, w, h]...[...]]
            Box is defined relative to the image.
        frame_n (int): The frame number belonning to the image
        dots (int): Number of dots that will be displayed.
            Past locations that will be visualized.
        figsize (tuple): (int,int) Size of the figure to display.
        dot_radius (int): Radius of the first dot.
        linewidth (int): Linewidth of the box to draw.
    Returns:
        Matplotlib figure
    '''
    if type(img) == str:
        my_img = skimage.io.imread(img)
    else:
        my_img = img
    fig,ax = plt.subplots(1, figsize=figsize)
    ax.imshow(my_img)
    for track_id in np.unique(tracks[:,1]):
    #for track_id in [0]:
        dot_color = plt.cm.tab10(((track_id)%11)/10)
        #print('dot_color', dot_color)
        #print(track_id)
        track = tracks[tracks[:,1]==track_id]
        boxes = track[track[:,0]<=frame_n]
        #reverse boxes order 
        boxes = np.flip(boxes, 0)
        # if object is still present in current frame
        #if boxes.size > 0 and boxes[0][0] == frame_n:
        #print('boxes', boxes[0])
        for i, box in enumerate(boxes):
            if box.size > 0:
                #print(box)
                x = box[2] * img.shape[1]
                y = box[3] * img.shape[0]
                w = box[4] * img.shape[1]
                h = box[5] * img.shape[0]
                if i == 0 and box[0] == frame_n:
                    #print('original box', box)
                    #print('drawn box',(x-w/2,y-h/2,w,h))
                    bbox = patches.Rectangle((x-w/2,y-h/2),w,h,linewidth=linewidth,edgecolor=dot_color,facecolor='none')
                    ax.add_patch(bbox)
                #print('dot_color',dot_color)
                #dot = patches.Circle((x, y), radius=dot_radius-(dot_radius/dots)*i, color=dot_color)
                dot = patches.Circle((x, y), radius=dot_radius* 1.0/(frame_n+1-box[0]), color=dot_color, alpha=0.8)
                #dot = patches.Circle((x, y), radius=dot_radius , color=dot_color, alpha=1.0/(box[0]+1 - frame_n))
                ax.add_patch(dot)
                if (i+1) >= dots:
                    break
    return fig