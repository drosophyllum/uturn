#!/usr/bin/ipython2

import subprocess
import sys
print "Running!"

if len(sys.argv) < 2:
    print "Usage: ./youtube2png videoid"
    exit()

videoid = sys.argv[1]

print "running youtube-dl"
url = "http://www.youtube.com/watch?v="+videoid
args=['./youtube-dl',
      '--no-playlist',
      '--extract-audio',
      '--audio-quality',
      '0',
      '--write-description',
      '--write-thumbnail',
      '--write-info-json',
      '--keep-video',
      '--id',
      '--reject-title',
      'Oeps interview blooper'
      'url',
      url]
subprocess.call(args)

print "running ffmpeg"
args=['ffmpeg',
      '-i',
      videoid+'.m4a',
      videoid+'.wav']
subprocess.call(args)

print "running wav2png"
args=['./wav2png',
      '-o',
      videoid+'.png',
      videoid+'.wav']
subprocess.call(args)
