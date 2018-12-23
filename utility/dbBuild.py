import threading
import os
import subprocess
import time
from Naked.toolshed.shell import execute_js

FNULL = open(os.devnull, 'w')
start = time.time()

# -LIVE will send to a live server, address stored in Environment Variable
nodeArgs = '-{}'.format(input('Local or Live host?\n').upper())
print(nodeArgs)

romAsk = input("Make roms? (Y)es or (N)o\n").upper()
makeroms = romAsk == "Y" or romAsk == "YES"
print(makeroms)


# can generate 1000 roms simultaneously faster than making as needed and checking if enough has been made to
# determine if enough data to determine all needed addresses for seeds
# easier time with threading with python and easier time with mongodb with nodejs ("pip install Naked" to
# run node scripts from within python)
def threadedfunc(sargs, game):
    subprocess.run(sargs, cwd=game, stdout=FNULL, stderr=subprocess.STDOUT)


def makeseeds(margs, game):
    for y in range(15):
        threaded = threading.Thread(target=threadedfunc, args=(margs, game))
        threaded.start()


# makes 500 seeds, 15 at a time = 33 batches
if makeroms:
    print("Generating Seasons roms")
    for seasons in range(33):
        args = ['./oracles-randomizer.exe']
        if seasons > 16:
            args.append('-hard')
        if seasons > 30:
            args.append('-treewarp')
        args.append('-noui')
        args.append('../OOS.blob')
        makeseeds(args, "seasons")
        while threading.active_count() > 1:
            pass
        print("Seasons batch {} done".format(seasons + 1))

    print("Generating Ages roms")
    for ages in range(33):
        args = ['./oracles-randomizer.exe']
        if ages > 16:
            args.append('-hard')
        if ages > 30:
            args.append('-treewarp')
        args.append('-noui')
        args.append('../OOA.blob')
        makeseeds(args, "ages")
        while threading.active_count() > 1:
            pass
        print("Ages batch {} done".format(ages + 1))
    print('Seed generation time: {} seconds'.format(time.time() - start))

seasonsSuccess = execute_js('ooscompare.js', nodeArgs)
AgesSuccess = execute_js('ooacompare.js', nodeArgs)

while threading.active_count() > 1:
    pass

print('Process complete after {} seconds'.format(time.time() - start))
