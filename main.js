function menu(item){
    if(item=='search'){
        menuSearch();
    }
    else{
        alert("unimplemented feature: "+item);
    }
}

function menuSearch(){
    $("#search").toggle();
}
