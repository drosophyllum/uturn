module wave
using Images
using JSON

img = imread(ARGS[1]);
w =  int(sum(sum(img,1),3)[:])
w = w/maximum(w)
w = (1.-w)

print(json(w))

end
