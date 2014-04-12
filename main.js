function menu(item){
    if(item=='search'){
        menuSearch();
        return;
    }
    if(item=='amplify'){
        menuAmplify();
        return;
    }
    if(item=='move'){
        menuMove();
        return;
    }

    alert("unimplemented feature: "+item);
}

function menuMove(){
    move=true;
    amplify=false;
    var selectcanvas = document.getElementById('selectcanvas');
    var selectcontext = selectcanvas.getContext('2d');
    selectcontext.clearRect(0,0,800,600);
}
function menuSearch(){
    $("#search").toggle();
}
function menuAmplify(){
    amplify = true;
    move=false;
}
$(document).ready(ready());
var peaks;

///////////////////////

function xml_http_post(url, data, callback) {
    var req = false;
    try {
        // Firefox, Opera 8.0+, Safari
        req = new XMLHttpRequest();
    }
    catch (e) {
        // Internet Explorer
        try {
            req = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                req = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
                alert("Your browser does not support AJAX!");
                return false;
            }
        }
    }
    req.open("POST", url, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            callback(req);
        }
    }
    req.send(data);
}



function test_handle(req) {
    var contents = document.getElementById("searchitem").value;
    if(req.responseText == '1'){
        stage='2'
        xml_http_post("index.html", stage+contents, test_handle)
        document.getElementById("searchbox").value = 'downloading song...';
        return
    }
    if(req.responseText == '2'){
        stage='3'
        xml_http_post("index.html", stage+contents, test_handle)
        document.getElementById("searchbox").value = 'converting song...';
        return
    }
    if(req.responseText == '3'){
        stage='4'
        xml_http_post("index.html", stage+contents, test_handle)
        document.getElementById("searchbox").value = 'retreiving waveform...';
        return
    }

    debug(req.responseText);
    num=heights.length
    durations[num]=getDuration(req.responseText);
    heights[num]=getJson(req.responseText);
    moveheights=heights.slice(0);
    colors[num]='#'+Math.floor(Math.random()*16777215).toString(16);
    document.getElementById("searchbox").value = '';
    $("#search").toggle();
    drawContext(heights);
}


/////////////////////

function getDuration(id){
    var oRequest =new XMLHttpRequest();
    var sURL = '../duration/'+id+'.txt';
    oRequest.open("GET",sURL,false);
    oRequest.send(null)
    if (oRequest.status==200) {
        peaks=oRequest.responseText;
        duration=eval(peaks);
        return duration
    }
}
function searched(e){
    if(e.which==13||e.keyCode==13){
        var contents = document.getElementById("searchbox").value;
        document.getElementById("searchitem").value = contents;
        stage='1'
        xml_http_post("index.html", stage+contents, test_handle)
    }
    document.getElementById("searchbox").value = 'downloading song...';

}
function getJson(id){
    var oRequest =new XMLHttpRequest();
    var sURL = '../peaks/'+id+'.txt';
    var numSongs = heights.length;
    var duration = durations[numSongs]
    oRequest.open("GET",sURL,false);
    oRequest.send(null)
    h=new Array();
    if (oRequest.status==200) {
        peaks=oRequest.responseText;
        peaks=eval(peaks);
        for(x=0;x<peaks.length-2;x+=3){
            h[x/3]=(peaks[x]+peaks[x+1]+peaks[x+2])/3*200
        }
        return h
    }
    else {
        alert("Error executing XMLHttpRequest call!");
    }
}

amplify=false;
move=false;
function debug(string){
    document.getElementById('debug').innerHTML+=string+"<br>";}
dragtarget=null;

function getHeight(myheights, songnum, x){
    var h=0;
    if (songnum < 0){
        return 0;
    }
    for(var song =0; song<=songnum; song+=1){
        if(isNaN(myheights[song][x]) == false)
            h+= myheights[song][x]
    }
    return h
}
function OnMouseDown(e){
    var selectcanvas = document.getElementById('selectcanvas');

    target=e.target;
    loffset = 15;
    if(target.className.indexOf('canvas')!==-1){
        dragStartX = e.clientX-loffset;
        dragStartY = e.clientY-100;
        for(var song =0; song<heights.length; song+=1){
            if(dragStartY < getHeight(heights,song, dragStartX) || amplify == true){
                if (amplify == false){
                    selectSong=song;
                }
                document.onmousemove=OnMouseMove;
                document.body.focus();
                document.onselectstart=function(){return false;};
                target.ondragstart = function(){return false;};
                dragtarget=target;
                return false;
            }
        }
    }
}
function drawContext(h){
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.clearRect(0,0,800,600);


    for(var song=0; song<heights.length;song+=1){
        for(x=0;x<=800;x+=1){
            context.strokeStyle=colors[song]
            context.beginPath();
            context.moveTo(x,getHeight(h, song-1, x));
            context.lineTo(x,getHeight(h, song,x));
            context.closePath();
            context.stroke();
        }
    }
}
function drawSelect(song,left,right,h){
    var selectcanvas = document.getElementById('selectcanvas');
    var selectcontext = selectcanvas.getContext('2d');
    selectcontext.clearRect(0,0,800,600);
    for(var x=left; x<=right; x+=1){
        if (h[song][x] > 0){
            selectcontext.strokeStyle='#0000FF';
            selectcontext.beginPath();
            selectcontext.moveTo(x,getHeight(h, song-1, x));
            selectcontext.lineTo(x,Math.max(getHeight(h, song, x), getHeight(h,song-1,x)));
            selectcontext.closePath();
            selectcontext.stroke();
        }
    }
}
function OnMouseUp(e){
    if(dragtarget!= null){
        document.onmousemove=null;
        document.onselectstart=null;
        dragtarget.ondragstart=null;
        dragStopX = e.clientX-15;
        dragStopY = e.clientY-100;

        dragtarget=null;
        if(amplify == false && move==false){
            selectStart = Math.min(dragStartX,dragStopX);
            selectStop = Math.max(dragStartX,dragStopX);
        }
        else{
            selectStart=0;
            selectStop=0;
            drawSelect(0,0,0,heights);
        }
        if(amplify == true){
            heights[selectSong] = moveheights[selectSong].slice(0);
            amplify=false;
        }
        if(move==true){
            dx=dragStopX-dragStartX;
            adx=Math.abs(dx);
            heights[selectSong]=moveheights[selectSong].slice(0);
            move=false;
        }
        drawContext(heights);
    }
}
selectSong=0;
selectStart=0;
selectStop=0;
function OnMouseMove(e){
    if (e==null)
        var e = window.event;
    loffset = 15;
    currentX=e.clientX-loffset;
    currentY=e.clientY-100;
    startx=Math.min(currentX,dragStartX);
    endx=Math.max(currentX,dragStartX);
    starty = Math.min(currentY,dragStartY);
    endy = Math.max(currentY, dragStartY);
    dy = endy-starty;
    dx = endx-startx;

    if(amplify == true){
        moveheights[selectSong]=heights[selectSong].slice(0);
        for(x=selectStart;x<selectStop;x+=1){
            moveheights[selectSong][x] = Math.max(0,heights[selectSong][x] + currentY - dragStartY);

        }
        drawSelect(selectSong,selectStart,selectStop, moveheights);
        drawContext(moveheights)
    }
    if(move==true){
        moveheights[selectSong]=heights[selectSong].slice(0);
        dx=currentX-dragStartX;
        adx=Math.abs(dx);
        if (dx< 0){
            for(x=800;x>=currentX;x-=1){
                if(isNaN(heights[selectSong][x-currentX+dragStartX])){
                    moveheights[selectSong][x]=0
                }
                else{
                    moveheights[selectSong][x]=Math.max(heights[selectSong][x-currentX+dragStartX],0);
                }
            }

            drawSelect(selectSong,currentX,800, moveheights);
        }
        if (dx > 0){
            for(x=0;x<=currentX;x+=1){
                if(isNaN(heights[selectSong][x-currentX+dragStartX])){

                    moveheights[selectSong][x]=0
                }
                else{
                    moveheights[selectSong][x]= Math.max(heights[selectSong][x-currentX+dragStartX]);
                }
            }
            drawSelect(selectSong,0,currentX, moveheights);
        }
        drawContext(moveheights);
    }

    if(move==false && amplify==false){ //selection
        drawSelect(selectSong,startx,endx,heights);
    }
}
function ready(){
    heights=new Array();
    document.onmousedown=OnMouseDown;
    document.onmouseup=OnMouseUp;
    colors = new Array();
    amplify=false;
    move=false;
    durations = new Array();
    debug('DUT5rEU6pqM');
    debug('4W8EwuMOi8I');
    debug('obV-OL3TwXo');
    moveheights=heights.slice(0);
    drawContext(heights);
}
