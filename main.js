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
    heights=new Array();

    moveheights=new Array();
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
function OnMouseDown(e){
    var selectcanvas = document.getElementById('selectcanvas');

    target=e.target;
    loffset = 15;
    if(target.className.indexOf('canvas')!==-1){
        dragStartX = e.clientX-loffset;
        dragStartY = e.clientY-100;
        if(dragStartY < heights[0][dragStartX]){
            document.onmousemove=OnMouseMove;
            document.body.focus();
            document.onselectstart=function(){return false;};
            target.ondragstart = function(){return false;};
            dragtarget=target;
            return false;
        }
    }
}
function drawContext(){
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.clearRect(0,0,800,600);
    for(x=0;x<=800;x+=1){
        context.strokeStyle='#000000'
        context.beginPath();
        context.moveTo(x,0);
        context.lineTo(x,heights[0][x]);
        context.closePath();
        context.stroke();
    }
}
function drawSelect(left,right,dy,h){
    var selectcanvas = document.getElementById('selectcanvas');
    var selectcontext = selectcanvas.getContext('2d');
    selectcontext.clearRect(0,0,800,600);
    for(var x=left; x<=right; x+=1){
        selectcontext.strokeStyle='#0000FF';
        selectcontext.beginPath();
        selectcontext.moveTo(x,0);
        selectcontext.lineTo(x,h[x]+dy);
        selectcontext.closePath();
        selectcontext.stroke();
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
        if(amplify == true){

            for(x=selectStart;x<=selectStop;x+=1){
                heights[0][x]= heights[0][x]+dragStopY-dragStartY;
            }
            drawSelect(selectStart,selectStop, 0, heights[0]);
            alert("amplified");
            moveheights[0]=heights[0].slice(0);
            amplify=false;
            debug(move);
        }
        if(move==true){
            dx=dragStopX-dragStartX;
            adx=Math.abs(dx);
            drawContext();
            alert()
            heights[0]=moveheights[0].slice(0);
            move=false;
        }
        drawContext();
    }
}
selectStart=0;
selectStop=800;
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
        drawSelect(selectStart,selectStop, currentY-dragStartY, heights[0]);
    }
    if(move==true){
        moveheights[0]=heights[0].slice(0);
        dx=currentX-dragStartX;
        adx=Math.abs(dx);
        if (dx< 0){
            for(x=800;x>=currentX;x-=1){
                moveheights[0][x]= heights[0][x-currentX+dragStartX];
            }
            drawSelect(currentX,800, 0, moveheights[0]);
        }
        if (dx > 0){
            for(x=0;x<=currentX;x+=1){
                moveheights[0][x]= heights[0][x-currentX+dragStartX];
            }
            drawSelect(0,currentX, 0, moveheights[0]);
        }
    }

    if(move==false && amplify==false){ //selection
        drawSelect(startx,endx,0,heights[0]);
    }
}
function ready(){
    document.onmousedown=OnMouseDown;
    document.onmouseup=OnMouseUp;
    heights[0]=getJson('DUT5rEU6pqM');
    drawContext();
}
