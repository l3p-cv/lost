from lost.pyapi import script
import os
import time

class IterationTxt(script.Script):
    '''This Script saves a txt file to instance path with current iteration.
    '''
    def main(self):
        script_in = self.inp
        script_out = self.outp
        instance_path = self.instance_context
        iteration = self.iteration
        path = os.path.join(instance_path, 'iter_{}.txt'.format(iteration))
        time.sleep(20)
        with open(path, 'w') as the_file:
            the_file.write('This is iteration {}\n'.format(iteration))

if __name__ == "__main__":
    my_script = IterationTxt()
