<template>
  <div class="queueCont">
    <h1>{{ props.theme }}</h1>
    <div class="tracklist">
      <div class="track"
        v-for="track in tracklist"
        :key="track.id"
        :data="track"
      >
        <p>{{ formatDisplayName(track.file.name) }}</p>
        <p>{{ formatDuration(track.duration) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const props = defineProps({
  tracklist: {
    type: Array,
    default: []
  },
  theme: {
    type: String,
    default: 'Playlist'
  }
})

const localTracklist = ref( ... props.tracklist )

const formatDuration = (duration) => {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const formatDisplayName = (fileName) => {
  return fileName.replace(/\.mp3$/, ''); // Retire l'extension .mp3
};
</script>

<style lang="scss" scoped>
.queueCont{
  background-color: #dadada83;
  border-radius: 5px;
  padding: 5px 10px;
  min-width: 250px;
  max-width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;

  h1, .option{
    margin: 7px 0;  
  }

  .tracklist{
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    overflow: scroll;

    .track{
      display: flex;
      flex-direction: row;
      width: 90%;
      justify-content: space-evenly;
      background-color: #bebebe83;
      border-radius: 5px;
      border: solid .2px #000;
      margin: 2px 0;
    }
  }
}
</style>