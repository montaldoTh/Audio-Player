<template>
  <div 
    class="app-container"
    :class="{ hover: isHovering }"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="playerContainer">
      <div class="container">
        <Player 
          ref="player1"
          :isPlaying="firstLecteurIsPlaying"
          @play="firstLecteurIsPlaying = true" 
          @pause="firstLecteurIsPlaying = false"
        />
      </div>
      <div class="container">
        <Player 
          lectorName="Second" 
          ref="player2"
          :isPlaying="secondLecteurIsPlaying"
          @play="secondLecteurIsPlaying = true" 
          @pause="secondLecteurIsPlaying = false"
        />
      </div>
    </div>
    <div class="queueContainer" >
      <Queue v-for="(playlist, index) in playlistsWithoutFiles" :key="index"
      :tracklist="playlist.tracks" :theme="playlist.theme"
      @selectPlaylist="bindPlaylist"
      />
    </div>
  </div>
</template>

<script setup>
import Player from './component/Player.vue';
import Queue from './component/Queue.vue';
import { ref } from 'vue';

const isHovering = ref(false)
const firstLecteurIsPlaying = ref(false)
const secondLecteurIsPlaying = ref(false)
const playlists = ref([])
const playlistsWithoutFiles = ref([])
const player1 = ref(null);
const player2 = ref(null);

const bindPlaylist = ({ player, theme }) => {
  const targetPlayer = player === '1' ? player1.value : player2.value
  if(targetPlayer && theme){
    const result = playlists.value.find(playlist => playlist.theme === theme)
    if(result){
      targetPlayer.setPlaylist(result.tracks)
    }
  }
}

const getFileWithDuration = (entry) => {
  return new Promise((resolve, reject) => {
    entry.file(async (file) => {
      const audio = new Audio(URL.createObjectURL(file))

      audio.addEventListener('loadedmetadata', () => {
        resolve({
          file,
          duration: audio.duration
        })
      })

      audio.addEventListener('error', (e) => {
        reject(new Error(`Erreur lors du chargement de la durée : ${e.message}`))
      })
    }, (error) => reject(error))
  })
}

const handleDragOver = () => {
  isHovering.value = true
}

const handleDragLeave = (event) => {
  if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
    isHovering.value = false;
  }
};

const handleDrop = async (event) => {
  event.preventDefault()

  isHovering.value = false

  const items = event.dataTransfer.items
  const playlistName = prompt("Entrez le thème de la playlist :")
  if(!playlistName) return

  try{
    const files = await Promise.all(Array.from(items).map(getFileEntries))
    const flatFiles = files.flat().filter(Boolean)
    
    const musicsData = ref({})
    musicsData.theme = playlistName
    musicsData.tracks = []

    flatFiles.forEach((flatFile) => {
      musicsData.tracks.push({
        name: flatFile.file.name,
        duration: flatFile.duration
      })
    })

    playlistsWithoutFiles.value.push(musicsData)
    
    playlists.value.push({
      theme: playlistName,
      tracks: flatFiles
    })

  } catch (error){
    console.error("Erreur lors du traitement des fichiers :", error)
  }
}

const getFileEntries = async (item) => {
  const entry = item.webkitGetAsEntry()
  if(entry.isFile){
    return await getFileWithDuration(entry)
  } else if (entry.isDirectory) {
    return await getFilesFromDirectory(entry)
  }
  return null
}

const getFilesFromDirectory = async (directoryEntry) => {
  const files = []
  const reader = directoryEntry.createReader()

  const readEntries = () => {
    return new Promise((resolve, reject) => {
      reader.readEntries(
        async(entries) => {
          if (entries.length === 0) {
            resolve()
          } else {
            for (const entry of entries){
              if(entry.isFile) {
                files.push(await getFileWithDuration(entry))
              } else if (entry.isDirectory){
                files.push(...await getFilesFromDirectory(entry))
              }
            }
            resolve(await readEntries())
          }
        },
        (error) => reject(error)
      )
    })
  }

  await readEntries()
  return files
}
</script>

<style lang="scss" scoped>
  .app-container{
    position: relative;
    display: flex;
    flex-direction: row;

    &::before {
      content: "Drag & Drop des fichiers ici";
      position: absolute;
      top: 0;
      left: 0;
      width: 500px;
      height: 88.5%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      font-size: 30px;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 10px;
      border-radius: 5px;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    &.hover::before{
      opacity: 1;
    }

    .playerContainer{
      display: flex;
      flex-direction: column;
    }

    .queueContainer{
      display: flex;
      flex-direction: row;
      margin: 5px;

      .queueCont{
        margin: 0 5px;
      }
    }
  }

  .container{
    display: flex;
    flex-direction: row;
    margin: 5px 0;
    position: relative;

    .playerCont{
      min-width: 500px;
      margin: 0 5px;
    }
  }
</style>
