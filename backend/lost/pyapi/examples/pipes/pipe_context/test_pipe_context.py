from lost.pyapi import script
import os

class TestPipeContext(script.Script):
    def main(self):
        pipe_context = self.pipe_context
        with open(os.path.join(pipe_context,'somefile.txt'), 'a') as the_file:
            the_file.write(str(self))

if __name__ == "__main__":
    my_script = TestPipeContext()
