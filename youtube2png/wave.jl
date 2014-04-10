module wave
using Images

function wave2array(path)
    img = imread(path);
    wave =  int(sum(sum(img,1),3)[:])
    wave = wave/maximum(wave)
    return (1-wave)
end

end
