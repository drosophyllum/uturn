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
        debug(move);
        return;
    }

    alert("unimplemented feature: "+item);
}

function menuMove(){
    move=true;
    amplify=false;
    debug(move);
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
    debug(move);
}
$(document).ready(ready());
var peaks;
function getJson(id){
    h=new Array();
    var oRequest =new XMLHttpRequest();
    var sURL = '../youtube2png/peaks/'+id+'.txt';
    oRequest.open("GET",sURL,false);
    oRequest.send(null)

    if (oRequest.status==200) {
        peaks=oRequest.responseText;
        peaks=eval(peaks);
        for(x=0;x<peaks.length-2;x+=3){
            h[x/3]=(peaks[x]+peaks[x+1]+peaks[x+2])/3*200
        }
        return h;
    }
    else {
        alert("Error executing XMLHttpRequest call!");
    }
}

amplify=false;
move=false;
function debug(string){
    document.getElementById('debug').innerHTML=string;}
debug(move)
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
        numsongs=heights.length;
        for(var song =0; song<numsongs; song+=1){
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
        debug(move);
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
            debug(move);
        }
        if(move==true){
            dx=dragStopX-dragStartX;
            adx=Math.abs(dx);
            heights[selectSong]=moveheights[selectSong].slice(0);
            move=false;
            debug(heights[0][50]);
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
            moveheights[selectSong][x] = heights[selectSong][x] + currentY - dragStartY;
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
                debug(dragStartX-currentX)
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
    colors[0] = '#000000';
    colors[1] = '#FF0000';
    heights[0]=getJson('DUT5rEU6pqM');
    //heights[1]=getJson('DUT5rEU6pqM');
    heights[1]=getJson('4W8EwuMOi8I');
    moveheights=heights.slice(0);
    drawContext(heights);
}
