var trackname ="null";
var artistname ="null";
var tracksname;
var artistsname;
var artistcheck = 0;
var trackcheck = 0;
var index = 0;
var counter = 1;
var tracksall ;
var PlayQueue2 ;
var backtimer2;
var running = 0;
var score = 0;
var found = 0;




(function() {
	
	
	var module = angular.module('PlayerApp');

	module.controller('BlindTestOTController', function($scope, $rootScope, API, PlayQueue, $routeParams, Auth, $sce) {
		$scope.playlist = $routeParams.playlist;
		$scope.username = $routeParams.username;
		$scope.name = '';
		$scope.tracks = [];
		$scope.data = null;
		$scope.total_duration = 0;

		$scope.currenttrack = PlayQueue.getCurrent();
		PlayQueue2 = PlayQueue.getCurrent();
		$scope.isFollowing = false;
		$scope.isFollowHovered = false;

		$rootScope.$on('playqueuechanged', function() {
			$scope.currenttrack = PlayQueue.getCurrent();
		});

		API.getPlaylist($scope.username, $scope.playlist).then(function(list) {
			console.log('got playlist', list);
			$scope.name = list.name;
			$scope.data = list;
			$scope.playlistDescription = $sce.trustAsHtml(list.description);
		});

		API.getPlaylistTracks($scope.username, $scope.playlist).then(function(list) {
			console.log('got playlist tracks lol', list);
			
			console.log('got playlist tracks length ');
			var tot = 0;
			list.forEach(function(track) {
				tot += track.track.duration_ms;
			});
			$scope.tracks = list;
			console.log('got tracks lol', list);
			console.log('tot', tot);
			$scope.total_duration = tot;

			// find out if they are in the user's collection
			var ids = $scope.tracks.map(function(track) {
				return track.track.id;
			});

			var i, j, temparray, chunk = 20;
			for (i = 0, j = ids.length; i < j; i += chunk) {
					temparray = ids.slice(i, i + chunk);
					var firstIndex = i;
					(function(firstIndex){
						API.containsUserTracks(temparray).then(function(results) {
							results.forEach(function(result, index) {
								$scope.tracks[firstIndex + index].track.inYourMusic = result;
							});
						});
					})(firstIndex);
			}
		});


		$scope.play = function(trackuri) {
			var trackuris = $scope.tracks.map(function(track) {
				return track.track.uri;
			});
			PlayQueue.clear();
			PlayQueue.enqueueList(trackuris);
			alert(trackuris.indexOf(trackuri).name);
			PlayQueue.playFrom(trackuris.indexOf(trackuri));
		};

		$scope.playall = function() {

			
			
			artistcheck = 0;
			trackcheck = 0;
			score = 0;
			found = 0;

			playset = document.getElementById('myRange');
			document.getElementById('totaltracks').innerHTML = playset.value;
			document.getElementById('finaltrackstotal').innerHTML = playset.value;
			document.getElementById('headertotaltracks').innerHTML = playset.value+" songs";
			document.getElementById('launchgame').style.display = "none";
			document.getElementById('gameview').style.display = "block";
			
			decompte(getTimeAdd(5));
			
			

			var alltracks = $scope.tracks;
			var shuffled = shuffle2(alltracks);


			tracksall = shuffled;

			tracksall = tracksall.splice(0,playset.value);
			console.log("sliced",tracksall);
			
			
			var trackuris =tracksall.map(function(track) {
				return track.track.uri;
			});
			tracksname =tracksall.map(function(track) {
				return track.track.name;
			});
			


			console.log("AVANT "+tracksname);
			tracksname=clean2(tracksname);

			console.log("TRACKS "+tracksname);

			
			PlayQueue.clear();
			//shuffled = shuffle(trackuris);
			//console.log("shuffle",shuffled);
			trackname=tracksname[0];
			//alert(shuffled)
			
			PlayQueue.enqueueList(trackuris);
			PlayQueue.playFrom(0);
			PlayQueue2 = PlayQueue;
			
		};


		$scope.toggleFromYourMusic = function(index) {
			if ($scope.tracks[index].track.inYourMusic) {
				API.removeFromMyTracks([$scope.tracks[index].track.id]).then(function(response) {
					$scope.tracks[index].track.inYourMusic = false;
				});
			} else {
				API.addToMyTracks([$scope.tracks[index].track.id]).then(function(response) {
					$scope.tracks[index].track.inYourMusic = true;
				});
			}
		};

		$scope.menuOptionsPlaylistTrack = function() {
			if ($scope.username === Auth.getUsername()) {
				return [[
					'Delete',
					function ($itemScope) {
						var position = $itemScope.$index;
						API.removeTrackFromPlaylist(
							$scope.username,
							$scope.playlist,
							$itemScope.t.track, position).then(function() {
								$scope.tracks.splice(position, 1);
							});
					}]]
			} else {
				return null;
			}
		};

		

	});

})();

function slider2(){
	i = document.getElementById('myRange');
	o = document.getElementById('launchgamebtnbtn');
	//$("#totaltracks").text(trackname) = i.value;
	text = "Play on "+i.value+" songs"
	// console.log(text,o.innerHTML);
	o.innerHTML = text;
}



function shuffle2(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
  
	  // Pick a remaining element...
	  randomIndex = Math.floor(Math.random() * currentIndex);
	  currentIndex -= 1;
  
	  // And swap it with the current element.
	  temporaryValue = array[currentIndex];
	  array[currentIndex] = array[randomIndex];
	  array[randomIndex] = temporaryValue;
	}
  
	return array;
  }

  function guessed2(rep){
	  
	//alert("c'est guessed2");
	var WrongSound = new Audio('sound/wrong.mp3');
	var CorrectSound = new Audio('sound/correct.mp3');

	

	//console.log(trackname);
	//alert(similarity(rep,trackname));

	if(similarity(rep.toLowerCase(),trackname.toLowerCase())>0.75){
		//alert("Track Ok");
		$(document).ready(function() {
			$("#trackvisual").text(trackname);
			$("#trackvisual").css("color", "#070");
			$("#trackvisual").css("font-weight", "bold");
			CorrectSound.play();
			wave();
			wave();
		});
		trackcheck=1;
		win2();
	}

	//alert(similarity(rep,artistname));


	if(similarity(rep.toLowerCase(),artistname.toLowerCase())<0.75 && similarity(rep.toLowerCase(),trackname.toLowerCase())<0.75){
		WrongSound.play();
		$(document).ready(function() {
			$("#guess").effect("shake", {times:1}, 350);
		  });

	}

	document.getElementById("guess").value ="";
	
  }

  function killpq(){
	//alert("c'est killpq");
	  if(PlayQueue2){
		PlayQueue2.pause();
		running=0;
		delete backtimer2;

	  }
	  }

  function win2(){
	//alert("c'est win2");
	foundadd2(1);
	scoreadd2(1);
	document.getElementById('secondes').innerHTML = "Nice one !";
	next2();	
  }

  function scoreadd2(point){
	//alert("c'est scoreadd2");
	  score += point;
	  document.getElementById('score').innerHTML = score;
	  document.getElementById('scorecount').innerHTML = score;
	  console.log("Score :"+score);
  }

  function foundadd2(i){
	//alert("c'est foundadd2");
	found += i;
	document.getElementById('foundcount').innerHTML = found;
	console.log("Found :"+found);
}

  function reveal2(){
	//alert("c'est reveal2");
	  if(document.getElementById('trackvisual').innerHTML == "Track"){
		$(document).ready(function() {
			$("#trackvisual").text(trackname);
			$("#trackvisual").css("color", "#ff6000");
			$("#trackvisual").css("font-weight", "bold");
		});
	  }
	  next2()
  }

  function next2(){
	//alert("c'est next2");
	if(counter<tracksname.length){
		PlayQueue2.pause();
		running=0;
		setTimeout(() => {
			resetTA2();
			
			trackname=tracksname[index];
			console.log("T: "+trackname);
			
			console.log("COUNTER "+counter);
			document.getElementById("indexcount").innerHTML = counter;
			decompte(getTimeAdd(5));
			PlayQueue2.playFrom(index);

		}, 2000);
	}
	else{
		endGame2();
		
		
		
	}
  }

  function endGame2(){
	//alert("c'est eg2");
	var EndSound = new Audio('sound/end.mp3');
	document.getElementById('foundprc').innerHTML = ((found/counter)*100).toFixed(2);

	setTimeout(() => {
		PlayQueue2.pause();
		running=0;
		delete backtimer2;



		

		$(function(){
			$("#dialog-end").dialog({
				autoOpen:false,
				width: 350,
				modal: true,
				buttons: [
					{
						text: 'Home',
						open: function() { $(this).addClass('yescls') },
						click: function() { 
							score = 0;
							found = 0;
							$("#dialog-end").dialog("close");
							document.location.href="#/home"; 
							window.location.reload();
							}
					},
					{
						text: "Replay",
						open: function() { $(this).addClass('cancelcls') },
						click: function() { 
							score = 0;
							found = 0;
							window.location.reload();
							$("#dialog-end").dialog("close");
						 }
					}
				  ],
				
					  
					  show: {
						effect: "highlight",
						duration: 1500
					  },
					  hide: {
						effect: "fade",
						duration: 1000
					  }
				
			});
		
			$("#dialog-end").dialog("open");



		})

		artistcheck = 0;
		trackcheck = 0;
		index = 0;
		counter = 1;
		running = 0;
		score = 0;
		found = 0;

		EndSound.play();
		

		//alert("FINITO");
	}, 1000);

  }

  function wave(){
	$("#guessform").submit(function (e) {
	if(trackcheck==1 && artistcheck==1){
	$(".ripple").remove();
  	var posX = $(this).offset().left,
	posY = $(this).offset().top,
	buttonWidth = $(this).width(),
	buttonHeight =  $(this).height();
  	$(this).prepend("<span class='ripple'></span>");
	if(buttonWidth >= buttonHeight) {
		buttonHeight = buttonWidth;
	} else {
		buttonWidth = buttonHeight; 
	}
	var x = e.pageX - posX - buttonWidth / 2;
	var y = e.pageY - posY - buttonHeight / 2;
 	$(".ripple").css({
		width: buttonWidth,
		height: buttonHeight,
		top: y + 'px',
		left: x + 'px'
	}).addClass("rippleEffect");
	}
	});
	console.log("wave");		
  }



  function similarity(s1, s2) {
	var longer = s1;
	var shorter = s2;
	if (s1.length < s2.length) {
	  longer = s2;
	  shorter = s1;
	}
	var longerLength = longer.length;
	if (longerLength == 0) {
	  return 1.0;
	}
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  } 


  function editDistance(s1, s2) {
	s1 = s1.toLowerCase();
	s2 = s2.toLowerCase();
  
	var costs = new Array();
	for (var i = 0; i <= s1.length; i++) {
	  var lastValue = i;
	  for (var j = 0; j <= s2.length; j++) {
		if (i == 0)
		  costs[j] = j;
		else {
		  if (j > 0) {
			var newValue = costs[j - 1];
			if (s1.charAt(i - 1) != s2.charAt(j - 1))
			  newValue = Math.min(Math.min(newValue, lastValue),
				costs[j]) + 1;
			costs[j - 1] = lastValue;
			lastValue = newValue;
		  }
		}
	  }
	  if (i > 0)
		costs[s2.length] = lastValue;
	}
	return costs[s2.length];
  }

  function getTimeAdd(timeadd){
	var aujourdhui = new Date();
	//alert(aujourdhui.getSeconds());
	aujourdhui.setSeconds(aujourdhui.getSeconds()+timeadd);
	var time = parseInt(aujourdhui.getTime() / 1000, 10);
	return time;

  }

  function resetTA2(){
	index++;
	counter++;
	  artistcheck=0;
	  trackcheck=0;
	$(document).ready(function() {
		$("#trackvisual").text("Track");
		$("#trackvisual").css("color", "")
		$("#trackvisual").css("font-weight", "");
	});
  }

  function decompte(time){
		document.getElementById("skipbtnbtn").disabled = true; 
		document.getElementById('myBar').style.width= 0;
		$("#guessform :input").prop('readonly', true);
		var aujourdhui = new Date();
		time_tmp = parseInt(aujourdhui.getTime() / 1000, 10);
		restant = time - time_tmp;

		console.log("time : "+time+" | time_tmp : "+time_tmp+" | restant : "+restant);
		
		jour = parseInt((restant / (60 * 60 * 24)), 10);
		heure = parseInt((restant / (60 * 60) - jour * 24), 10);
		minute = parseInt((restant / 60 - jour * 24 * 60 - heure * 60), 10);
		seconde = parseInt((restant - jour * 24 * 60 * 60 - heure * 60 * 60 - minute * 60), 10);
		
		if(restant==0){
			console.log("TOP");
			seconde="Good luck!";
			console.log(seconde);
		}

		document.getElementById('secondes').innerHTML = seconde;
		if (time_tmp < time){
			setTimeout(() => {decompte(time)}, 1000);
		}
		else{
			document.getElementById("skipbtnbtn").disabled = false; 
			$("#guessform :input").prop('readonly', false);
			document.getElementById("guess").focus();
			newBackTimer();
			
		}
	}

	function newBackTimer(){
		//alert("c'est nbt");
		running=0;
		delete backtimer2;
		backtimer2 = new BackTimer2();
		running=1;
		backtimer2.launch(getTimeAdd(30));


	}

	function clean2(rtracksname){
		var cleaned=rtracksname;
		for(var i =0;i<rtracksname.length;i++){
			if(cleaned[i].replace(/[(].*[)]|- .*/gm, '')!=""){
				cleaned[i] = cleaned[i].replace(/[(].*[)]|- .*/gm, '');
			}	
		}
		return cleaned;
	}

	function showplay(){
		document.getElementById('launchgamebtnbtn').style.display = "block";
	
	}



	class BackTimer2 {
		constructor() {}
		async launch(time) {
			//alert("c'est bt2");
			if(running==1){
			var aujourdhui = new Date();
			time_tmp = parseInt(aujourdhui.getTime() / 1000, 10);
			restant = time - time_tmp;
			
			
			jour = parseInt((restant / (60 * 60 * 24)), 10);
			heure = parseInt((restant / (60 * 60) - jour * 24), 10);
			minute = parseInt((restant / 60 - jour * 24 * 60 - heure * 60), 10);
			seconde = parseInt((restant - jour * 24 * 60 * 60 - heure * 60 * 60 - minute * 60), 10);

			var nwidth = (30 - restant)*100/30+"%";
		
			console.log("Back restant : "+restant);
			// console.log("CurWidth :"+document.getElementById('myBar').style.width+" new :"+nwidth);

			document.getElementById('myBar').style.width= nwidth;

			
			
			if (time_tmp < time){
				setTimeout(() => {this.launch(time)}, 1000);
			}
			else{

				reveal2();
				
			}
		}
		else{
			console.log("backtimer2 stopped");
		}
		}
	  }

	  