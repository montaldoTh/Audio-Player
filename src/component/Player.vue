<template>
  <div class="playerCont">
    <h1> {{ props.lectorName }} lecteur</h1>
    <div class="vol">
      <label>Volume</label>
      <input type="range" min="0" max="100" v-model="volume" @input="updateVolume" />
      <label>{{ volume }} %</label>
    </div>
    <div class="fade">
      <label>Fade Time</label>
      <input type="range" min="1" max="5" v-model="fadeTime" step="1" />
      <label>{{ fadeTime }} seconds</label>
    </div>
    <div class="file">
      <button v-if="currentTrack" type="button" @click="playPause">{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <p v-if="currentTrack">{{ currentTrack }}</p>
    </div>
    <audio ref="audio1" loop></audio>
    <audio ref="audio2" loop></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineEmits } from 'vue'

const props = defineProps({
  lectorName: {
    type: String,
    default: "Premier"
  }
})

const emit = defineEmits(['play', 'pause'])

// Déclaration des variables réactives
const volume = ref(100);
const fadeTime = ref(5);
const isPlaying = ref(false);
const firstPlayer = ref(false); // Indicateur du lecteur actif
const volPerc = ref(100); // Pourcentage du volume actuel
let fadeInterval;
const currentTrack = ref('');
const isHovering = ref(false)

// Références pour les éléments audio
const audio1 = ref(new Audio());
const audio2 = ref(new Audio());

// Fonction pour mettre à jour le volume des deux lecteurs audio
const updateVolume = () => {
  const adjustedVolume = Math.max(volume.value / 100, 0.01); // Assure que le volume est au moins 0.01

  // Vérifie si un fondu est en cours
  if (!fadeInterval) {
    audio1.value.volume = adjustedVolume; // Définit le volume pour audio1
    audio2.value.volume = 1 - adjustedVolume; // Définit le volume pour audio2
  } else {
    // Applique le volume ajusté en fonction du fondu
    audio1.value.volume = (volPerc.value / 100) * adjustedVolume; // Ajuste le volume pour audio1
    audio2.value.volume = (1 - (volPerc.value / 100)) * adjustedVolume; // Ajuste le volume pour audio2
  }
}

// Fonction de fondu entre les deux lecteurs audio
const fade = () => {
  const change = (100 / (fadeTime.value * 10)); // Calcule le changement de volume par appel basé sur le temps de fondu

  if (firstPlayer.value) {
    // Fade in pour le premier lecteur
    volPerc.value = Math.min(100, volPerc.value + change); // Augmente le volume du premier lecteur
  } else {
    // Fade out pour le deuxième lecteur
    volPerc.value = Math.max(0, volPerc.value - change); // Diminue le volume du deuxième lecteur
  }

  // Ajustement des volumes
  updateVolume(); // Appelle updateVolume pour mettre à jour les volumes
}

// Démarre l'intervalle de fade
const startFade = () => {
  // Nettoyage des intervalles précédents pour éviter les fuites
  if (fadeInterval) {
    clearInterval(fadeInterval);
  }
  
  fadeInterval = setInterval(fade, 100); // Appelle la fonction fade toutes les 100ms
}

// Fonction pour arrêter le fade
const stopFade = () => {
  clearInterval(fadeInterval);
  fadeInterval = null; // Réinitialiser fadeInterval pour éviter des comportements inattendus
}

// Fonction pour jouer ou mettre en pause la musique
const playPause = () => {
  isPlaying.value = !isPlaying.value; // Inverse l'état de lecture
  if (isPlaying.value) {
    audio1.value.play();
    audio2.value.play();
    emit('play')
    if (firstPlayer.value) {
      startFade(); // Démarre le fade uniquement si la musique change
    }
  } else {
    audio1.value.pause();
    audio2.value.pause();
    stopFade();
    emit('pause')
  }
}

// Gère le cycle de vie pour arrêter l'intervalle lors du démontage
onBeforeUnmount(() => {
  stopFade();
});
</script>

<style lang="scss" scoped>
  .playerCont{
    background-color: #dadada83;
    max-width: 500px;
    max-height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 5px;
    padding: 7px;
    transition: background-color 0.3s;

    .vol, .fade, .file{
      display: flex;
      flex-direction: row;
      margin: 3px 0;

      label{
        padding-top: 2px;
        margin: 0 5px;
      }
      button{
        margin-right: 5px;
        max-width: 50px;
        max-height: 20px;
        min-width: 50px;
        min-height: 20px;
        margin-top: 13px;
      }
    }

    .fade{
      input{
        margin-left: 15px;
      }
      label{
        margin: 0;
      }
    }
  }
</style>