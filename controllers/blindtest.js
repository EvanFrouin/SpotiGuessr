var trackname ="null";
var artistname ="null";
var index = 0;
var tracksall ;

(function() {
	
	
	var module = angular.module('PlayerApp');

	module.controller('BlindTestController', function($scope, $rootScope, API, PlayQueue, $routeParams, Auth, $sce) {
		$scope.playlist = $routeParams.playlist;
		$scope.username = $routeParams.username;
		$scope.name = '';
		$scope.tracks = [];
		$scope.data = null;
		$scope.total_duration = 0;

		$scope.currenttrack = PlayQueue.getCurrent();
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
			console.log('got playlist tracks', list);
			var tot = 0;
			list.items.forEach(function(track) {
				tot += track.track.duration_ms;
			});
			$scope.tracks = list.items;
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
			var alltracks = $scope.tracks;
			var shuffled = shuffle(alltracks);
			tracksall=shuffled;
			var trackuris =shuffled.map(function(track) {
				return track.track.uri;
			});

			
			PlayQueue.clear();
			//shuffled = shuffle(trackuris);
			console.log("shuffle",shuffled);
			trackname=$scope.tracks[0].track.name;
			artistname=$scope.tracks[0].track.artists[0].name;
			//alert(shuffled)
			
			PlayQueue.enqueueList(trackuris);
			PlayQueue.playFrom(0);
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

function shuffle(array) {
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

  function guessed(rep){
	var WrongSound = new Audio('sound/wrong.mp3')
	var CorrectSound = new Audio('sound/correct.mp3')
	var tracksname =tracksall.map(function(track) {
		return track.track.name;
	});
	var artistsname =tracksall.map(function(track) {
		return track.track.artists[0].name;
	});

	//console.log(trackname);
	//alert(similarity(rep,trackname));

	if(similarity(rep,trackname)>0.75){
		//alert("Track Ok");
		$(document).ready(function() {
			$("#trackvisual").text(trackname);
			$("#trackvisual").css("color", "#070")
			$("#trackvisual").css("font-weight", "bold");
			CorrectSound.play();
		});
	}

	//alert(similarity(rep,artistname));

	if(similarity(rep,artistname)>0.75){
		//alert("Artist Ok");
		$(document).ready(function() {
			$("#artistvisual").text(artistname);
			$("#artistvisual").css("color", "#070")
			$("#artistvisual").css("font-weight", "bold");
			CorrectSound.play();
		});
	}

	if(similarity(rep,artistname)<0.75 && similarity(rep,trackname)<0.75){
		WrongSound.play();
	}

	document.getElementById("guess").value ="";
	
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