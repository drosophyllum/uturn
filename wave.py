import numpy
from scipy import misc
import sys
imageid = sys.argv[1]


imagepath = 'png/%s.png'%imageid
image = misc.imread(imagepath)

t=numpy.sum(image,axis=(0))[:,1]
x=1-(1.0*t/max(t))



windowsize = 10
f=1.0/windowsize*numpy.ones(windowsize)


y=list(numpy.convolve(x,f, mode='same'))




with open('peaks/%s.txt'%imageid,'w') as peaks:
    peaks.write(str(y))
