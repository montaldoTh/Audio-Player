<template>
  <div>
    <div class="container"
      :class="{ hover: firstContainerHovered}"
      @dragover.prevent="handleDragOver('firstContainer')"
      @dragleave="(event) => handleDragLeave('firstContainer', event)"
      @drop.prevent="(event) => handleDrop('firstContainer', event)"
    >
      <Player 
        @play="firstLecteurIsPlaying = true" 
        @pause="firstLecteurIsPlaying = false"
      />
      <Queue />
    </div>
    <div class="container"
      :class="{ hover: secondContainerHovered}"
      @dragover.prevent="handleDragOver('secondContainer')"
      @dragleave="(event) => handleDragLeave('secondContainer', event)"
      @drop.prevent="(event) => handleDrop('secondContainer', event)"
    >
      <Player 
        lectorName="Second" 
        @play="secondLecteurIsPlaying = true" 
        @pause="secondLecteurIsPlaying = false"
      />
      <Queue />
    </div>
  </div>
</template>

<script setup>
import Player from './component/Player.vue';
import Queue from './component/Queue.vue';
import { ref } from 'vue';

const firstContainerHovered = ref(false)
const secondContainerHovered = ref(false)
const firstLecteurIsPlaying = ref(false)
const secondLecteurIsPlaying = ref(false)
const queuePrimary = ref([])
const queueSecondary = ref([])

const handleDragOver = (container) => {
  if (container === 'firstContainer') {
    firstContainerHovered.value = true;
  } else {
    secondContainerHovered.value = true;
  }
}

const handleDragLeave = (container, event) => {
  if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
    if (container === 'firstContainer') {
      firstContainerHovered.value = false;
    } else {
      secondContainerHovered.value = false;
    }
  }
};

const handleDrop = async (container, event) => {
  event.preventDefault()

  if(container === 'firstContainer'){
    firstContainerHovered.value = false;
  } else {
    secondContainerHovered.value = false;
  }

  const items = event.dataTransfer.items
  try{
    const files = await Promise.all(Array.from(items).map(getFileEntries))
    const flatFiles = files.flat().filter(Boolean)

    if(container === 'firstContainer'){
      queuePrimary.value.push(...flatFiles)
      console.log("Fichier ajoutés au premier conteneur :", flatFiles);
      console.log("Contenu du conteneur : ", queuePrimary.value);
    } else if (container === 'secondContainer'){
      queueSecondary.value.push(...flatFiles)
      console.log("Fichier ajoutés au second conteneur :", flatFiles);
      console.log("Contenu du conteneur : ", queueSecondary.value);
    }
  } catch (error){
    console.error("Erreur lors du traitement des fichiers :", error)
  }
}

const getFileEntries = async (item) => {
  const entry = item.webkitGetAsEntry()
  if(entry.isFile){
    return await getFile(entry)
  } else if (entry.isDirectory) {
    return await getFilesFromDirectory(entry)
  }
  return null
}

const getFile = (entry) =>{
  return new Promise((resolve, reject) => {
    entry.file(
      (file) => resolve(file),
      (error) => reject(error)
    )
  })
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
                files.push(await getFile(entry))
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
  .container{
    display: flex;
    flex-direction: row;
    margin: 5px 0;
    position: relative;

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

    .playerCont{
      min-width: 500px;
      margin: 0 5px;
    }
  }
</style>
