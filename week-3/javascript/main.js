// Search


// Query SoundCloud API
class SoundCloudAPI {

  constructor() {
    SC.initialize({
      client_id: 'cd9be64eeb32d1741c17cb39e41d254d'
    })
    this.currentPlayer = undefined
    this.currentTrackId = undefined
    this.interval = undefined
  }

  injectListenerForDurationBar(card) {
    return setInterval(() => {
      const currentDuration = Number(card.children[2].children[1].children[1].value)
      card.children[2].children[1].children[1].value = Number(card.children[2].children[1].children[1].value) + 1000
      card.children[2].children[1].children[0].innerText = `${Math.floor(currentDuration / 60000)}:${('00' + (Math.floor((currentDuration / 1000) % 60))).slice(-2)}`
    }, 1000)
  }

  revertButtonToTheDefaultState(card) {
    const playIcon = document.createElement('i')
    playIcon.classList.add('play', 'icon', 'player-icon')
    const playButton = card.children[0].children[1]
    playButton.removeChild(playButton.firstChild)
    playButton.appendChild(playIcon)
    clearInterval(this.interval)
  }

  updateClassVariables(player, track, interval) {
    this.currentPlayer = player
    this.currentTrackId = track.id
    this.interval = interval
  }

  play(track, cardIndex, autoPlay=true) {
    SC.stream(`/tracks/${track.id}`).then(player => {
      console.log(track)
      console.log(player)
      player.play().then(() => {
        const card = document.getElementsByClassName('cards')[0].children[cardIndex]
        const currentDuration = Number(card.children[2].children[1].children[1].value)
        player.seek(currentDuration)
        player.setVolume(Number(card.children[2].children[2].children[1].children[0].value) / 100)
        const interval = this.injectListenerForDurationBar( card)
        player.on('finish', () => {
          this.revertButtonToTheDefaultState(card)
        })
        this.updateClassVariables(player, track, interval)
        console.log('Playback started.')
      }).catch(e => {
        console.error('Playback rejected. Try calling play() from a user interaction.', e)
      })
    })
  }

  pause() {
    if (this.currentPlayer) {
      this.currentPlayer.pause()
      clearInterval(this.interval)
    } else {
      console.log('No song to pause.')
    }
  }

  getTracksByName(name) {
    return new Promise((resolve, reject) => {
      SC.get('/tracks', {
        q: name
      }).then((tracks) => {
        this.renderTracks(tracks)
        resolve(tracks)
      }).catch(e => reject(e))
    })
  }

  renderPlayButton(track, index) {
    const playIcon = document.createElement('i')
    playIcon.classList.add('play', 'icon', 'player-icon')
    const pauseIcon = document.createElement('i')
    pauseIcon.classList.add('pause', 'icon', 'player-icon')
    const playButton = document.createElement('div')
    playButton.classList.add('play-button', 'animate')
    playButton.addEventListener('click', () => {
      if (playButton.childNodes[0].classList.contains('play')) {
        playButton.removeChild(playIcon)
        playButton.appendChild(pauseIcon)
        this.play(track, index)
      } else {
        playButton.removeChild(pauseIcon)
        playButton.appendChild(playIcon)
        this.pause(track)
      }
    })
    playButton.appendChild(playIcon)
    return playButton
  }

  renderImage(track, PlayButton) {
    const imageImg = document.createElement('img')
    imageImg.src = track.artwork_url || 'styles\\themes\\default\\assets\\images\\default-track-artwork.png'
    imageImg.classList.add('image_img')
    const image = document.createElement('div')
    image.classList.add('image')
    return this.bundle(image, imageImg, PlayButton)
  }

  renderTitle(track) {
    const anchor = document.createElement('a')
    anchor.href = track.permalink_url
    anchor.target = '_blank'
    anchor.innerText = track.title
    const header = document.createElement('div')
    header.classList.add('header')
    header.appendChild(anchor)
    const title = document.createElement('div')
    title.classList.add('content')
    title.appendChild(header)
    return title
  }

  renderTimeBar(track) {
    const currentSongTime = document.createElement('span')
    currentSongTime.classList.add('time-current')
    currentSongTime.innerText = '0:00'
    const durationRange = document.createElement('input')
    durationRange.classList.add('duration-range')
    durationRange.type = 'range'
    durationRange.value = 0
    durationRange.max = track.duration
    durationRange.addEventListener('input', (e) => {
      const currentDuration = durationRange.value
      if (this.currentPlayer && this.currentTrackId === track.id) {
        this.currentPlayer.seek(currentDuration)
      }
      currentSongTime.innerText = `${Math.floor(currentDuration / 60000)}:${('00' + (Math.floor((currentDuration / 1000) % 60))).slice(-2)}`
    })
    const totalSongTime = document.createElement('span')
    totalSongTime.classList.add('time-total')
    totalSongTime.innerText = `${Math.floor(track.duration / 60000)}:${('00' + (Math.floor((track.duration / 1000) % 60))).slice(-2)}`
    const timeBar = document.createElement('div')
    timeBar.classList.add('time-bar')
    this.bundle(timeBar, currentSongTime, durationRange, totalSongTime)
    return { timeBar, currentSongTime, durationRange }
  }

  renderIconBar(currentSongTime, durationRange) {
    const refreshIcon = document.createElement('i')
    refreshIcon.classList.add('undo', 'icon', 'toolset-icon', 'animate')
    refreshIcon.addEventListener('click', () => {
      if (this.currentPlayer && this.currentTrackId === track.id) {
        this.currentPlayer.seek(0)
      }
      currentSongTime.innerText = '0:00'
      durationRange.value = 0
    })
    const repeatIcon = document.createElement('i')
    repeatIcon.classList.add('sync', 'icon', 'toolset-icon', 'animate')
    const iconBar = document.createElement('div')
    iconBar.classList.add('iconBar')
    return this.bundle(iconBar, refreshIcon, repeatIcon)
  }

  renderSoundBar(track) {
    const soundIcon = document.createElement('i')
    soundIcon.classList.add('volume', 'up', 'icon', 'toolset-icon')
    const soundMenu = document.createElement('div')
    soundMenu.classList.add('sound-menu', 'animate')
    const soundRange = document.createElement('input')
    soundRange.classList.add('sound-range')
    soundRange.type = 'range'
    soundRange.max = 100
    soundRange.value = 40
    soundRange.addEventListener('input', () => {
      if (this.currentPlayer && this.currentTrackId === track.id) {
        console.log(soundRange.value / 100)
        this.currentPlayer.setVolume(soundRange.value / 100)
      }
    })
    soundIcon.addEventListener('click', () => {
      soundMenu.style.display = soundMenu.style.display ==='block' ? 'none' : 'block'
    })
    soundMenu.appendChild(soundRange)
    soundMenu.style.display = 'none'
    const soundBar = document.createElement('div')
    soundBar.classList.add('sound-bar')
    return this.bundle(soundBar, soundIcon, soundMenu)
  }

  renderToolbar (IconBar, TimeBar, SoundBar) {
    const toolbar = document.createElement('div')
    toolbar.classList.add('toolbar')
    return this.bundle(toolbar, IconBar, TimeBar, SoundBar)
  }

  renderPlaylist() {
    const addPlaylistIcon = document.createElement('i')
    addPlaylistIcon.classList.add('add', 'icon')
    const span = document.createElement('span')
    span.innerText = 'Add to playlist'
    const button = document.createElement('div')
    button.classList.add('ui', 'bottom', 'attached', 'button', 'js-button')
    return this.bundle(button, addPlaylistIcon, span)
  }

  renderCard(Image, Title, Toolbar, Playlist) {
    const card = document.createElement('div')
    card.classList.add('card')
    return this.bundle(card, Image, Title, Toolbar, Playlist)
  }

  bundle(parent, ...children) {
    const fragment = new DocumentFragment()
    children.forEach(child => fragment.appendChild(child))
    parent.appendChild(fragment)
    return parent
  }

  renderTracks(tracks) {
    const renderTrack = (track, index) => {
      const PlayButton = this.renderPlayButton(track, index)
      const Image = this.renderImage(track, PlayButton)
      const Title = this.renderTitle(track)
      const { timeBar, currentSongTime, durationRange } = this.renderTimeBar(track)
      const IconBar = this.renderIconBar(currentSongTime, durationRange)
      const SoundBar = this.renderSoundBar(track)
      const Toolbar = this.renderToolbar(IconBar, timeBar, SoundBar)
      const Playlist = this.renderPlaylist()
      const Card = this.renderCard(Image, Title, Toolbar, Playlist)
      document.querySelector('.cards').appendChild(Card)
    }
    tracks.forEach((track, index) => renderTrack(track, index))
  }
}

const main = async () => {
  const soundCloudAPIObject = new SoundCloudAPI()
  const radioheadTracks = await soundCloudAPIObject.getTracksByName('radiohead')
  //soundCloudAPIObject.play(radioheadTracks)
}

main()


// Display cards



// Add to playlist and play
