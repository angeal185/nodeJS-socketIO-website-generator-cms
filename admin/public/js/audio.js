

var assetPath = "/audio/";
 var sounds = [
     {src:"success.mp3", id:"success"},
     {src:"init.mp3", id:"init"},
     {src:"hover.mp3", id:"hover"},
     {src:"close.mp3", id:"close"}
 ];
 //createjs.Sound.alternateExtensions = ["mp3"];    // if the passed extension is not supported, try this extension
 //createjs.Sound.on("fileload", handleLoad); // call handleLoad when each sound loads
 createjs.Sound.registerSounds(sounds, assetPath);

 function handleLoad() {

     createjs.Sound.play("success");

     //createjs.Sound.play("init");
 }
