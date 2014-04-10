function menu(item){
    if(item=='search'){
        menuSearch();
    }
    else{
        if(item=='amplify'){
            menuAmplify();
        }
        else{
            if(item=='move'){
                menuMove();
                debug(move);
            }
            else{
                alert("unimplemented feature: "+item);
            }
        }
    }
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
function getJson(){
    var oRequest =new XMLHttpRequest();
    var sURL = '../youtube2png/peaks/DUT5rEU6pqM.txt';
    oRequest.open("GET",sURL,false);
    oRequest.send(null)

    if (oRequest.status==200) {
        peaks=oRequest.responseText;
        heights=eval(peaks);
        for(x=0;x<heights.length-2;x+=3){
            heights[x/3]=(heights[x]+heights[x+1]+heights[x+2])/3*200
        }
        moveheights=heights.slice(0);
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
        document.onmousemove=OnMouseMove;
        document.body.focus();
        document.onselectstart=function(){return false;};
        target.ondragstart = function(){return false;};
        dragtarget=target;
        return false;
    }
}
function OnMouseUp(e){
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    var selectcanvas = document.getElementById('selectcanvas');
    var selectcontext = selectcanvas.getContext('2d');


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
            selectcontext.clearRect(0,0,800,600);

            for(x=selectStart;x<=selectStop;x+=1){
                heights[x]= heights[x]+dragStopY-dragStartY;
                selectcontext.strokeStyle='#0000FF';
                selectcontext.beginPath();
                selectcontext.moveTo(x,0);
                selectcontext.lineTo(x,heights[x]);
                selectcontext.closePath();
                selectcontext.stroke();
            }
            moveheights=heights.slice(0);
            for(x=0;x<=800;x+=1){
                context.strokeStyle='#000000'
                context.beginPath();
                context.moveTo(x,0);
                context.lineTo(x,heights[x]);
                context.closePath();
                context.stroke();
            }
        amplify=false;
        debug(move);
        }
        if(move==true){
            context.clearRect(0,0,800,600);
            dx=dragStopX-dragStartX;
            adx=Math.abs(dx);
            heights=moveheights.slice(0);
            move=false;
        }
            context.clearRect(0,0,800,600);
            for(x=0;x<=800;x+=1){

                context.strokeStyle='#000000'
                context.beginPath();
                context.moveTo(x,0);
                context.lineTo(x,heights[x]);
                context.closePath();
                context.stroke();
            }

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
    var canvas = document.getElementById('selectcanvas');
    var context = canvas.getContext('2d');

    if(amplify == true){
        context.clearRect(0,0,800,600);
        for(x=selectStart;x<=selectStop;x+=1){
            context.strokeStyle='#0000FF';
            context.beginPath();
            context.moveTo(x,0);
            context.lineTo(x,heights[x]+currentY-dragStartY);
            context.closePath();
            context.stroke();
        }
    }
    if(move==true){
        context.clearRect(0,0,800,600);
            dx=currentX-dragStartX;
            adx=Math.abs(dx);
            if (dx< 0){
                for(x=800;x>=currentX;x-=1){
                    moveheights[x]= heights[x-currentX+dragStartX];
                    context.strokeStyle='#0000FF';
                    context.beginPath();
                    context.moveTo(x,0);
                    context.lineTo(x,moveheights[x]);
                    context.closePath();
                    context.stroke();
                }

            }
            if (dx > 0){
                for(x=0;x<=currentX;x+=1){
                    moveheights[x]= heights[x-currentX+dragStartX];
                    context.strokeStyle='#0000FF';
                    context.beginPath();
                    context.moveTo(x,0);
                    context.lineTo(x,moveheights[x]);
                    context.closePath();
                    context.stroke();
                }

            }
    }

    if(move==false && amplify==false){ //selection
        context.clearRect(0,0,800,600);
        for(x=startx;x<=endx;x+=1){
            context.strokeStyle='#0000FF';
            context.beginPath();
            context.moveTo(x,0);
            context.lineTo(x,heights[x]);
            context.closePath();
            context.stroke();
        }
    }
}
function ready(){
    document.onmousedown=OnMouseDown;
    document.onmouseup=OnMouseUp;
    getJson();
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.strokeStyle='#000';
    for(x=0; x<800; x+=1){
        context.beginPath();
        context.moveTo(x,0);
        context.lineTo(x,heights[x]);
        context.closePath();
        context.stroke();
    }
}
