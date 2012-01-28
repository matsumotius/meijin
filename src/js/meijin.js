$(function(){
  var meijin = {};
  meijin.tip = {
    body   : $("<div>done</div>").css({ 
               position  : "fixed",
               left      : "10px",
               top       : "10px",
               "z-index" : "999",
               "background-color" : "yellow"
             }),
    exists : false,
    popup  : function(){
      $(meijin.tip.body).show(800, function(){ $(meijin.tip.body).hide(500); });
    }
  };
  chrome.extension.onRequest.addListener(function(request, sender){
    if(false == meijin.tip.exists) $("body").append(meijin.tip.body);
    meijin.tip.popup();
    meijin.tip.exists = true;
  });
});
