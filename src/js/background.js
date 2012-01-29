$(function(){
  var meijin = {
    host     : "http://pinterest.com",
    token    : "",
    update   : false,
    boards   : localStorage["boards"] ? JSON.parse(localStorage["boards"]) : [],
    comments : ["☹","☻","☺","^^;","(^^)","(^_^;)","(^^ゞ","m(__)m","(^O^)","^_^;","(・∀・)","(*^_^*)","(^^♪","(´・ω・｀)","(^^)v"]
  };
  meijin.__defineGetter__("comment", function(){
    return meijin.comments[Math.floor(Math.random()*meijin.comments.length)];
  });
  meijin.parse = function(data){
    meijin.token  = $("*[name=csrfmiddlewaretoken]", data).val();
    if(false == meijin.update) return;
    meijin.boards = {};
    $(".BoardList", data).find("li").each(function(index, board){
      var name = $(board).find("span").text();
      meijin.boards[String(name)] = { id : $(board).attr("data") };
    });
    localStorage["boards"] = JSON.stringify(meijin.boards);
  };
  meijin.sync = function(info, tab, callback){
    $.ajax({
      url     : meijin.pin_url(info.srcUrl, tab.url, tab.title),
      success : function(data){
        meijin.parse(data);
        meijin.update = false;
        if(callback) callback();
      }
    });
  };
  meijin.get_token = function(info, tab, callback){
    if(meijin.token.length > 0) return;
    meijin.sync(info, tab, callback);
  };
  meijin.update_boards = function(info, tab){
    meijin.update = true;
    meijin.sync(info, tab, function(){
      meijin.remove_boards(meijin.create_boards);
    });
  };
  meijin.success = function(q){
    chrome.tabs.getSelected(null, function(tab){
      chrome.tabs.sendRequest(tab.id, { is_success : true, message : "done" });
    });
  };
  meijin.pin_url = function(image, source, title){
    var base = meijin.host + "/pin/create/bookmarklet";
    return base + "?media=" + image  + 
                  "&url="   + source + 
                  "&alt="   + ""     + 
                  "&title=" + title  + "&is_video=false&";
  };
  meijin.query = function(info, tab){
    var query = {
      tags      : "",
      replies   : "",
      buyable   : "",
      title     : tab.title,
      url       : tab.url,
      media_url : info.srcUrl,
      caption   : meijin.comment
    };
    query.csrfmiddlewaretoken = meijin.token;
    return query;
  };
  meijin.post = function(name, query){
    query.board = meijin.boards[name].id;
    $.ajax({
      type    : "POST",
      url     : meijin.host + "/pin/create/bookmarklet/",
      data    : query,
      success : function(data){
        meijin.success(data);
      }
    });
  };
  meijin.click_callback = function(name){
    return function(info, tab){
      if(meijin.token.length > 0){
        meijin.post(name, meijin.query(info, tab));
      } else {
        meijin.get_token(info, tab, function(){ meijin.post(name, meijin.query(info, tab)); });
      }
    };
  };
  meijin.remove_boards = function(callback){
    chrome.contextMenus.removeAll(callback)
  };
  meijin.create_boards = function(){
    for(var name in meijin.boards){
      var board = meijin.boards[name];
      chrome.contextMenus.create({
        title    : name,
        contexts : ["image"],
        onclick  : meijin.click_callback(name)
      });
    }
    chrome.contextMenus.create({
      title    : "Update Board List",
      contexts : ["image"],
      onclick  : function(info, tab){ meijin.update_boards(info, tab); }
    });
  };
  meijin.create_boards();
});
