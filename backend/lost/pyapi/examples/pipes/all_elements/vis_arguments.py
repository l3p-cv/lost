from lost.pyapi import script

arguments = {'out' : {'value': 'Test <b>output</b>!',
                    'help': 'HTML to display'}
            }


class VisArguments(script.Script):

    def main(self):
        # Your code here
        self.outp.add_visual_output(html=self.get_arg('out'))

if __name__ == "__main__":
    my_script = VisArguments()
