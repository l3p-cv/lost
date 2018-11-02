from lost.pyapi import script
import os

class BreakLoop(script.Script):
    '''The purpose of this script is just to break the next loop in iteration 1.
    '''
    def main(self):
        if self.iteration == 1:
            self.break_loop()

if __name__ == "__main__":
    my_script = BreakLoop()
