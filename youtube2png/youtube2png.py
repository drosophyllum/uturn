#!/usr/bin/python2

import simplejson as json
import subprocess
import sys
import os
print "Running!"


def debug(string):
    print string

def error(string, e=None):
    print "ERROR:"
    print string
    if e is not None:
        print '(%s) %s' %(str(e.errno),e.strerror)
    exit(1)

if len(sys.argv) < 2:
    error("Usage: ./youtube2png videoid")

videoid = sys.argv[1]
debug('Video id: %s'%videoid)


required_paths = ['video',
                  'song',
                  'duration',
                  'wav',
                  'thumb',
                  'description',
                  'info',
                  'png',
                  'peaks'
                 ]
for path in required_paths:
    if not os.path.exists(path):
        try:
            debug('Creating directory: %s'%path)
            os.mkdir(path)
        except Exception as e:
            error('failed to make directory: %s'%path,e)

if not os.path.isfile('video/%s.mp4'%videoid):
    debug('running youtube-dl')
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
          'Oeps interview blooper',
          'url',
          'http://www.youtube.com/watch?v=%s'%videoid
         ]
    try:
        subprocess.call(args)
    except Exception as e:
        error('youtube-dl failed!', e)
    try:
        os.rename('%s.mp4'%videoid, 'video/%s.mp4'%videoid)
        os.rename('%s.jpg'%videoid, 'thumb/%s.jpg'%videoid)
        os.rename('%s.mp4.description'%videoid, 'description/%s.txt'%videoid)
        os.rename('%s.info.json'%videoid, 'info/%s.json'%videoid)
        os.rename('%s.m4a'%videoid, 'song/%s.m4a'%videoid)
    except Exception as e:
        error('youtube-dl failed!', e)

if not os.path.isfile('wav/%s.wav'%videoid):
    debug("running ffmpeg")
    args=['ffmpeg',
          '-i',
          'song/%s.m4a'%videoid,
          'wav/%s.wav'%videoid
         ]
    try:
        subprocess.call(args)
    except Exception as e:
        error('ffmpeg failed!', e)

with open('info/%s.json'%videoid,'r') as jsonfile:
    data = json.load(jsonfile)
duration = data['duration']

if not os.path.isfile('duration/%s.txt'%videoid):
    try:
        with open('duration/%s.txt'%videoid,'w') as durationfile:
            durationfile.write(str(duration))
    except Exception as e:
        error('writing duration file failed!', e)

if not os.path.isfile('png/%s.png'%videoid):
    debug('running wav2png')
    args=['./wav2png',
          '-w'
          '%s'%str(int(duration)*6),
          '-o',
          'png/%s.png'%videoid,
          'wav/%s.wav'%videoid
         ]
    try:
        subprocess.call(args)
    except Exception as e:
        error('wav2png failed!',e)

if not os.path.isfile('peaks/%s.txt'%videoid):
    print "running julia"
    args=['julia',
          'wave.jl',
         'png/%s.png'%videoid
         ]
    try:
        juliaout = subprocess.check_output(args)
    except Exception as e:
        error('wave.jl failed!', e)
    try:
        with open('peaks/%s.txt'%videoid,'w') as peakfile:
            peakfile.write(juliaout)
    except Exception as e:
        error('writing peaks file failed!', e)




debug('%s seconds'%duration)

