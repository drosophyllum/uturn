#!/usr/bin/python

import simplejson as json
import subprocess
import sys
import os

import threading
import BaseHTTPServer
import SimpleHTTPServer
import os
import subprocess
PORT = 8080
def debug(string):
    print string

def error(string, e=None):
    print "ERROR:"
    print string
    if e is not None:
        print '(%s) %s' %(str(e.errno),e.strerror)
    exit(1)



def download(videoid):
    debug('Video id: %s'%videoid)
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
        if True:
#        try:
            print videoid
            print os.path.exists('%s.mp4'%videoid)
            print os.path.exists('video')
            os.rename('%s.mp4'%videoid, 'video/%s.mp4'%videoid)
            os.rename('%s.jpg'%videoid, 'thumb/%s.jpg'%videoid)
            os.rename('%s.mp4.description'%videoid, 'description/%s.txt'%videoid)
            os.rename('%s.info.json'%videoid, 'info/%s.json'%videoid)
            os.rename('%s.m4a'%videoid, 'song/%s.m4a'%videoid)
#        except Exception as e:
#            error('youtube-dl rename failed!', e)


def convert(videoid):
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

def waveform(videoid):
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

def findpeaks(videoid):
    if not os.path.isfile('peaks/%s.txt'%videoid):
        print "running wave.py"
        args=['python',
              'wave.py',
              videoid
             ]
        try:
           juliaout = subprocess.check_output(args)
        except Exception as e:
            error('wave.jl failed!', e)

class TestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    """The test example handler."""

    def do_POST(self):
        """Handle a post request by returning the square of the number."""
        length = int(self.headers.getheader('content-length'))
        datastring = self.rfile.read(length)
        stage = int(datastring[0])
        videoid = datastring[1:]

        if stage==1:
            download(videoid)
            result = '1'
        if stage==2:
            convert(videoid)
            result = '2'
        if stage==3:
            waveform(videoid)
            result = '3'
        if stage==4:
            findpeaks(videoid)
            result = videoid
        self.wfile.write(result)

def start_server():
    """Start the server."""
    server_address = ("", PORT)
    server = BaseHTTPServer.HTTPServer(server_address, TestHandler)
    server.serve_forever()

if __name__ == "__main__":
    print "Running!"
    start_server()
