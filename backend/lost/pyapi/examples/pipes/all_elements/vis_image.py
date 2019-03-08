from lost.pyapi import script

ARGUMENTS = {'caption' : {
                    'value': '<h4>A cat in front of a wall.</h4>',
                    'help': 'HTML to display'}
            }

class VisImage(script.Script):

    def main(self):
        # Your code here
        img_path = self.get_path('cat.jpg', context='static')
        self.outp.add_visual_output(html=self.get_arg('caption'), 
            img_path=img_path)

if __name__ == "__main__":
    my_script = VisImage()
