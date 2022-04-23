// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

// global vars
//var pattern = [2, 1, 4, 3, 2, 1, 2, 4];
var mistakeCounter = 0
var clueHoldTime = 1000; //for the additional feature; how long to hold each clue's light/sound
var pattern = [];
for (let i=0; i<8; i++) {
    pattern.push(Math.ceil(Math.random() * 4))  //ceil because we dont have a 0 button id 
}

var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;
var guessCounter = 0;
var timer = 0;
var timeInterval; 



function startGame() {
  //initialize variables 
  progress = 0;
  mistakeCounter = 0;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
  
  var timeLeft = 60;
  
  timeInterval = setInterval(function() {
      document.getElementById("timerParagraph").innerHTML = timeLeft;  //the 60 sec timer is showen
      timeLeft -= 1; //timer decreased by 1
      if(gamePlaying == false){
        clearInterval(timeInterval);
        stopGame();
      }
      if(timeLeft < 0){
        clearInterval(timeInterval);
        alert("Time is up!!"); 
        stopGame();
      }
    }, 1000);
}

function stopGame() {
  gamePlaying = false;
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  document.getElementById("timerParagraph").innerHTML = "You have 60 seconds to complete the game."  //to display the message when game is stopped
}

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

function playClueSequence(){
  guessCounter = 0;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    clueHoldTime -= 15;  //this makes the hold time decrease each turn 
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
}

function guess(btn){
  console.log("user guessed: " + btn);
  if(!gamePlaying){
    return;
  }
  
  // add game logic here
  if(pattern[guessCounter] == btn){
    //Guess was correct!
    if(guessCounter == progress){
      if(progress == pattern.length - 1){
        winGame();
      }
      else{
        progress++;
        playClueSequence();
      }
    }
    else{
      guessCounter++;
    }
  }
  else{
    mistakeCounter++;  //used to give the user strikes 
    if(mistakeCounter > 2){
      loseGame();
    }
    else{  //letting the user know they made a mistake and how many strikes they have left
      if(mistakeCounter == 1){ 
        alert("You have made a mistake. You have 2 chances left.");
      }
      else{
        alert("You have made "+ mistakeCounter + " mistakes. You have 1 chance left.");
      }
      
    }
  }
}

function loseGame(){
  stopGame();
  alert("Game Over. You lost.");
}

function winGame(){
  stopGame();
  alert("Game Over. You won!!");
}


// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)
