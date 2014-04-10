module wave
using Images,ImageView

img = [] 
function wave2array(path)
    img = imread(path);
    wave =  int(sum(sum(img,1),3)[:]) 
    wave = wave/maximum(wave)
    return wave 
end

p= "aude.png"
wave2array(p)




end
