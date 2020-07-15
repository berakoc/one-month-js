// Search


// Query SoundCloud API
const playTrack = (track, autoPlay=true) => {
  SC.stream(`/tracks/${track.id}`).then(function(player){
    player.play().then(function(){
      console.log('Playback started!', {track});
    }).catch(function(e){
      console.error('Playback rejected. Try calling play() from a user interaction.', e);
    });
  });
}

function getTracksByName(name) {
  return new Promise((resolve, reject) => {
    SC.get('/tracks', {
      q: name
    }).then(function(tracks) {
      resolve(tracks)
    }).catch(e => reject(e))
  })
}

const main = async () => {
  SC.initialize({
    client_id: 'cd9be64eeb32d1741c17cb39e41d254d'
  });
  const radioheadTracks = await getTracksByName('radiohead')
  playTrack(radioheadTracks[7])
}

//main()


// Display cards



// Add to playlist and play
