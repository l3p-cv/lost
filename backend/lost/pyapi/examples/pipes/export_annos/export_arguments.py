from lost.pyapi import script
import os

arguments = {'title' : { 'value':'ExportArguments',
                        'help': 'Title for the exported file'},
             'content' : { 'value':'My super cool default argument',
                          'help':'Content of the exported file'
                         }
            }

class ExportArguments(script.Script):
    ''' A script to test arguments.

    This script will write the arguments to a file in instance context and make
    this file available as data export.
    '''
    def main(self):
        script_out = self.outp
        path = self.get_path('argument_export.txt')
        with open(path, 'w') as the_file:
            the_file.write('Title argument: {}\n'.format(self.get_arg('title')))
            the_file.write('Content argument: {}\n'.format(self.get_arg('content')))
        script_out.add_data_export(file_path=path)

if __name__ == "__main__":
    my_script = ExportArguments()
