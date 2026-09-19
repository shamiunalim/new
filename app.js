import { API, TIKTOK_API } from "./api.js"
import { FFmpeg } from "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.15/dist/esm/index.js"
import { fetchFile, toBlobURL } from "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/esm/index.js"
const pages = document.querySelectorAll(".page")
const navItems = document.querySelectorAll(".nav-item")
const sidebar = document.getElementById("sidebar")
const menuBtn = document.getElementById("menuBtn")

const platformButtons = document.querySelectorAll(".platform-card")
const selectedPlatform = document.getElementById("selectedPlatform")
const downloadUrl = document.getElementById("downloadUrl")
const downloadBtn = document.getElementById("downloadBtn")
const downloadOptions = document.getElementById("downloadOptions")
const downloadResult = document.getElementById("downloadResult")

let currentPlatform = "tiktok"
let currentType = "video"

let ffmpeg = null
let ffmpegLoaded = false
async function loadFFmpeg() {
  if (ffmpegLoaded) return

  ffmpeg = new FFmpeg()

  const baseURL =
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm"

  await ffmpeg.load({
    coreURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.js`,
      "text/javascript"
    ),
    wasmURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm"
    ),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    )
  })

  ffmpegLoaded = true
}
// =========================
// NAVIGATION
// =========================

function openPage(pageName) {
  pages.forEach(page => {
    page.classList.toggle(
      "active",
      page.id === pageName
    )
  })

  navItems.forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.page === pageName
    )
  })

  sidebar.classList.remove("open")

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}


navItems.forEach(item => {
  item.addEventListener("click", () => {
    openPage(item.dataset.page)
  })
})


document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", () => {
    openPage(button.dataset.open)
  })
})


menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open")
})


document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    sidebar.classList.remove("open")
  }
})


// =========================
// CLOCK
// =========================

function updateClock() {
  const now = new Date()

  const time = now.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }
  )

  const date = now.toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  )

  document.getElementById("clock").textContent = time
  document.getElementById("date").textContent = date
}

updateClock()
setInterval(updateClock, 1000)


// =========================
// TOAST
// =========================

function toast(message) {
  const el = document.getElementById("toast")

  el.textContent = message
  el.classList.add("show")

  clearTimeout(window.toastTimer)

  window.toastTimer = setTimeout(() => {
    el.classList.remove("show")
  }, 3500)
}


// =========================
// PLATFORM
// =========================

platformButtons.forEach(button => {

  button.addEventListener("click", () => {

    platformButtons.forEach(x =>
      x.classList.remove("selected")
    )

    button.classList.add("selected")

    currentPlatform = button.dataset.platform

    selectedPlatform.textContent =
      currentPlatform.charAt(0).toUpperCase() +
      currentPlatform.slice(1)

    downloadResult.innerHTML = ""

    if (currentPlatform === "youtube") {
      downloadOptions.style.display = "flex"

      document.querySelectorAll(".type-btn").forEach(btn => {
        btn.style.display = "block"
      })

    } else if (currentPlatform === "tiktok") {
      downloadOptions.style.display = "flex"

    } else {
      downloadOptions.style.display = "none"
    }

    downloadUrl.placeholder =
      currentPlatform === "youtube"
        ? "URL atau judul YouTube..."
        : `Masukkan URL ${currentPlatform}...`
  })

})


// =========================
// TYPE
// =========================

document.querySelectorAll(".type-btn").forEach(button => {

  button.addEventListener("click", () => {

    document
      .querySelectorAll(".type-btn")
      .forEach(x =>
        x.classList.remove("active")
      )

    button.classList.add("active")

    currentType = button.dataset.type
  })

})


// =========================
// DOWNLOAD
// =========================

downloadBtn.addEventListener(
  "click",
  downloadMedia
)


downloadUrl.addEventListener("keydown", e => {

  if (e.key === "Enter") {
    downloadMedia()
  }

})


async function downloadMedia() {

  const input = downloadUrl.value.trim()

  if (!input) {
    toast("Masukkan URL terlebih dahulu.")
    downloadUrl.focus()
    return
  }

  downloadBtn.disabled = true

  downloadBtn.innerHTML =
    "<span>MEMPROSES...</span><b>⏳</b>"

  downloadResult.innerHTML = `
    <div class="result loading">
      <div class="loader"></div>
      <span>Mengambil media...</span>
    </div>
  `

  try {

    let result

    if (currentPlatform === "tiktok") {

      result = await downloadTikTok(input)

    } else if (currentPlatform === "youtube") {

      result = await downloadYouTube(input)

    } else if (currentPlatform === "facebook") {

      result = await downloadFacebook(input)

    } else if (currentPlatform === "instagram") {

      result = await downloadInstagram(input)

    }

    if (!result?.url) {
      throw new Error(
        result?.message ||
        "Link download tidak ditemukan."
      )
    }

    showDownloadResult(result)

    toast("Media berhasil ditemukan.")

  } catch (error) {

    console.error(error)

    downloadResult.innerHTML = `
      <div class="result error">
        <strong>❌ Gagal</strong>
        <span>${escapeHTML(
          error.message ||
          "Terjadi kesalahan."
        )}</span>
      </div>
    `

    toast("Gagal mengambil media.")

  } finally {

    downloadBtn.disabled = false

    downloadBtn.innerHTML =
      "<span>DOWNLOAD</span><b>↓</b>"
  }
}





// =========================
// HD FOTO
// =========================

async function processHDPhoto(file, scale = 2) {

  const url = URL.createObjectURL(file)

  try {

    const img = new Image()

    img.src = url

    await img.decode()

    const canvas = document.createElement("canvas")

    canvas.width =
      Math.round(img.naturalWidth * scale)

    canvas.height =
      Math.round(img.naturalHeight * scale)

    const ctx =
      canvas.getContext("2d")

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      img,
      0,
      0,
      canvas.width,
      canvas.height
    )

    return await new Promise(resolve => {

      canvas.toBlob(
        resolve,
        "image/jpeg",
        0.95
      )

    })

  } finally {

    URL.revokeObjectURL(url)

  }
}

async function processHDVideo(
  file,
  targetHeight = 1080,
  onProgress = () => {}
) {

  await loadFFmpeg()

  const inputName = "input-video"
  const outputName = "output-hd.mp4"

  await ffmpeg.writeFile(
    inputName,
    await fetchFile(file)
  )

  const videoURL =
    URL.createObjectURL(file)

  const video =
    document.createElement("video")

  video.src = videoURL
  video.muted = true

  await new Promise((resolve, reject) => {

    video.onloadedmetadata = resolve
    video.onerror = reject

  })

  const ratio =
    video.videoWidth /
    video.videoHeight

  let height = targetHeight

  let width =
    Math.round(
      (height * ratio) / 2
    ) * 2

  URL.revokeObjectURL(videoURL)

  ffmpeg.on(
    "progress",
    ({ progress }) => {

      onProgress(
        Math.round(progress * 100)
      )

    }
  )

  await ffmpeg.exec([
    "-i",
    inputName,

    "-vf",
    `scale=${width}:${height}:flags=lanczos`,

    "-c:v",
    "libx264",

    "-preset",
    "veryfast",

    "-crf",
    "18",

    "-c:a",
    "aac",

    "-b:a",
    "192k",

    "-movflags",
    "+faststart",

    outputName
  ])

  const data =
    await ffmpeg.readFile(outputName)

  await ffmpeg.deleteFile(inputName)
  await ffmpeg.deleteFile(outputName)

  return new Blob(
    [data.buffer],
    {
      type: "video/mp4"
    }
  )
}

// =========================
// FACEBOOK
// =========================

async function downloadFacebook(url) {

  const response = await fetch(
    API.facebook(url)
  )

  const data = await response.json()

  if (!data?.status) {
    throw new Error(
      data?.message ||
      "Facebook gagal diproses."
    )
  }

  const item =
    data.data ||
    data.result ||
    data

  const download =
    item.dlink ||
    item.url ||
    item.download ||
    item.link

  if (!download) {
    throw new Error(
      "Link Facebook tidak ditemukan."
    )
  }

  return {
    url: download,
    type: "video",
    filename: "facebook.mp4"
  }
}


// =========================
// INSTAGRAM
// =========================

async function downloadInstagram(url) {

  const response = await fetch(
    API.instagram(url)
  )

  const data = await response.json()

  if (!data?.status) {
    throw new Error(
      data?.message ||
      "Instagram gagal diproses."
    )
  }

  const item =
    data.data ||
    data.result ||
    data

  const download =
    item.dlink ||
    item.url ||
    item.download ||
    item.link

  if (!download) {
    throw new Error(
      "Link Instagram tidak ditemukan."
    )
  }

  return {
    url: download,
    type: "video",
    filename: "instagram.mp4"
  }
}


// =========================
// YOUTUBE
// =========================

async function downloadYouTube(input) {

  let yturl = input
  let title = "youtube"

  const isURL =
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/i
      .test(input)

  if (!isURL) {

    const searchResponse =
      await fetch(API.youtubeSearch(input))

    const search =
      await searchResponse.json()

    if (
      !search?.status ||
      !search.data?.items?.length
    ) {
      throw new Error(
        "Video YouTube tidak ditemukan."
      )
    }

    const item = search.data.items[0]

    yturl =
      item.url ||
      `https://www.youtube.com/watch?v=${item.id}`

    title =
      item.title ||
      "youtube"
  }

  const type =
    currentType === "video"
      ? "mp4"
      : "mp3"

  const response =
    await fetch(
      API.youtube(yturl, type)
    )

  const data =
    await response.json()

  if (!data?.status) {
    throw new Error(
      data?.message ||
      "YouTube gagal diproses."
    )
  }

  const result =
    data.data ||
    data.result ||
    data

  const download =
    result.dlink ||
    result.url ||
    result.download ||
    result.link

  if (!download) {
    throw new Error(
      "Link YouTube tidak ditemukan."
    )
  }

  return {
    url: download,
    type:
      type === "mp4"
        ? "video"
        : "audio",
    filename:
      sanitizeFilename(title) +
      "." +
      type
  }
}


// =========================
// TIKTOK
// =========================

async function downloadTikTok(url) {

  const body =
    new URLSearchParams({
      url,
      count: 1,
      cursor: 0
    })

  const response =
    await fetch(
      TIKTOK_API,
      {
        method: "POST",
        headers: {
          "content-type":
            "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body
      }
    )

  const data =
    await response.json()

  if (!data?.data) {
    throw new Error(
      "Data TikTok tidak ditemukan."
    )
  }

  const v = data.data

  const music =
    v.music ||
    v.music_info?.play ||
    null

  const video =
    v.play ||
    v.wmplay ||
    null

  const images =
    v.images ||
    v.image_post_info?.images
      ?.map(
        x =>
          x.display_image
            ?.url_list?.[0] ||
          x.owner_watermark_image
            ?.url_list?.[0]
      )
      .filter(Boolean) ||
    []

  if (
    currentType === "audio" ||
    !video
  ) {

    if (!music) {
      throw new Error(
        "Audio TikTok tidak ditemukan."
      )
    }

    return {
      url: music,
      type: "audio",
      filename: "tiktok.mp3"
    }
  }

  if (images.length) {

    return {
      url: images[0],
      type: "image",
      filename: "tiktok.jpg",
      images,
      music
    }
  }

  return {
    url: video,
    type: "video",
    filename: "tiktok.mp4",
    music
  }
}


// =========================
// RESULT
// =========================

function showDownloadResult(data) {

  let buttons = `
    <a
      class="download-result-btn"
      href="${escapeAttribute(data.url)}"
      target="_blank"
      rel="noopener"
      download
    >
      DOWNLOAD
    </a>
  `

  if (data.music) {

    buttons += `
      <a
        class="download-result-btn secondary"
        href="${escapeAttribute(data.music)}"
        target="_blank"
        rel="noopener"
      >
        AUDIO
      </a>
    `
  }

  downloadResult.innerHTML = `
    <div class="result success">

      <div class="result-icon">
        ✓
      </div>

      <div class="result-info">
        <strong>Media siap</strong>
        <span>
          ${escapeHTML(
            data.filename ||
            "download"
          )}
        </span>
      </div>

      <div class="result-actions">
        ${buttons}
      </div>

    </div>
  `
}


// =========================
// IMAGE BASE64
// =========================

window.imageToBase64 = function() {

  const file =
    document.getElementById(
      "imageFile"
    ).files[0]

  if (!file) {
    toast("Pilih gambar terlebih dahulu.")
    return
  }

  const reader =
    new FileReader()

  reader.onload = () => {

    document.getElementById(
      "imageBase64"
    ).value = reader.result

    toast("Gambar berhasil dikonversi.")
  }

  reader.readAsDataURL(file)
}


// =========================
// TEXT BASE64
// =========================

window.encodeText = function() {

  const input =
    document.getElementById(
      "textInput"
    ).value

  try {

    document.getElementById(
      "textOutput"
    ).value =
      btoa(
        unescape(
          encodeURIComponent(input)
        )
      )

  } catch {
    toast("Gagal encode text.")
  }
}


// =========================
// JSON
// =========================

window.formatJSON = function() {

  const input =
    document.getElementById(
      "jsonInput"
    ).value

  try {

    const result =
      JSON.stringify(
        JSON.parse(input),
        null,
        2
      )

    document.getElementById(
      "jsonOutput"
    ).value = result

  } catch {

    document.getElementById(
      "jsonOutput"
    ).value =
      "JSON tidak valid."

  }
}


// =========================
// URL
// =========================

window.encodeURL = function() {

  document.getElementById(
    "urlOutput"
  ).value =
    encodeURIComponent(
      document.getElementById(
        "urlInput"
      ).value
    )
}


window.decodeURL = function() {

  try {

    document.getElementById(
      "urlOutput"
    ).value =
      decodeURIComponent(
        document.getElementById(
          "urlInput"
        ).value
      )

  } catch {

    toast("URL tidak valid.")
  }
}


// =========================
// QR
// =========================

window.generateQR = function() {

  const value =
    document.getElementById(
      "qrInput"
    ).value.trim()

  if (!value) {
    toast("Masukkan teks atau URL.")
    return
  }

  const url =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=300x300&data=" +
    encodeURIComponent(value)

  document.getElementById(
    "qrResult"
  ).innerHTML = `
    <img
      src="${url}"
      alt="QR Code"
    >
  `
}


// =========================
// PASSWORD
// =========================

window.generatePassword = function() {

  let length =
    parseInt(
      document.getElementById(
        "passwordLength"
      ).value
    )

  if (
    !length ||
    length < 6
  ) {
    length = 16
  }

  if (length > 64) {
    length = 64
  }

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "0123456789!@#$%^&*()_+-="

  const values =
    new Uint32Array(length)

  crypto.getRandomValues(values)

  let password = ""

  for (let i = 0; i < length; i++) {

    password +=
      chars[
        values[i] % chars.length
      ]
  }

  document.getElementById(
    "passwordOutput"
  ).value = password
}


// =========================
// TOOLS JSON
// =========================

window.formatToolsJSON = function() {

  const input =
    document.getElementById(
      "toolsJson"
    ).value

  try {

    document.getElementById(
      "toolsJson"
    ).value =
      JSON.stringify(
        JSON.parse(input),
        null,
        2
      )

  } catch {

    toast("JSON tidak valid.")
  }
}


// =========================
// BASE64
// =========================

window.base64Encode = function() {

  const input =
    document.getElementById(
      "base64Input"
    ).value

  document.getElementById(
    "base64Output"
  ).value =
    btoa(
      unescape(
        encodeURIComponent(input)
      )
    )
}


window.base64Decode = function() {

  try {

    const input =
      document.getElementById(
        "base64Input"
      ).value

    document.getElementById(
      "base64Output"
    ).value =
      decodeURIComponent(
        escape(
          atob(input)
        )
      )

  } catch {

    toast("Base64 tidak valid.")
  }
}


// =========================
// HELPERS
// =========================

function sanitizeFilename(name) {

  return String(name)
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) ||
    "download"
}


function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}


function escapeAttribute(value) {

  return String(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}


// =========================
// 3D EFFECT
// =========================

document
  .querySelectorAll(
    ".service-card,.platform-card,.tool-card,.dashboard-card"
  )
  .forEach(card => {

    card.addEventListener(
      "mousemove",
      e => {

        const rect =
          card.getBoundingClientRect()

        const x =
          e.clientX - rect.left

        const y =
          e.clientY - rect.top

        const rotateY =
          ((x / rect.width) - 0.5) * 8

        const rotateX =
          ((y / rect.height) - 0.5) * -8

        card.style.transform =
          `perspective(900px)
           rotateX(${rotateX}deg)
           rotateY(${rotateY}deg)
           translateY(-4px)`
      }
    )

    card.addEventListener(
      "mouseleave",
      () => {
        card.style.transform = ""
      }
    )

  })
  document
  .querySelectorAll(
    ".service-card,.platform-card,.tool-card,.dashboard-card"
  )
  .forEach(card => {

    card.addEventListener(
      "mousemove",
      e => {

        const rect =
          card.getBoundingClientRect()

        const x =
          e.clientX - rect.left

        const y =
          e.clientY - rect.top

        const rotateY =
          ((x / rect.width) - 0.5) * 8

        const rotateX =
          ((y / rect.height) - 0.5) * -8

        card.style.transform =
          `perspective(900px)
           rotateX(${rotateX}deg)
           rotateY(${rotateY}deg)
           translateY(-4px)`
      }
    )

    card.addEventListener(
      "mouseleave",
      () => {
        card.style.transform = ""
      }
    )

  })
  
// =========================
// MAXIEL MUSIC PLAYER
// =========================

const bgMusic = document.getElementById("bgMusic")
const musicPlayer = document.getElementById("musicPlayer")
const musicMini = document.getElementById("musicMini")
const musicPanel = document.querySelector(".music-panel")
const musicClose = document.getElementById("musicClose")
const musicPlay = document.getElementById("musicPlay")
const musicPrev = document.getElementById("musicPrev")
const musicNext = document.getElementById("musicNext")
const musicStatus = document.getElementById("musicStatus")
const musicName = document.getElementById("musicName")
const musicNumber = document.getElementById("musicNumber")

if (
  bgMusic &&
  musicPlayer &&
  musicMini &&
  musicPlay &&
  musicPrev &&
  musicNext
) {

  // =========================
  // DAFTAR MUSIC
  // =========================

  const musicList = [

    {
      name:"Tony-Q Ra Doyan Reggae",
      url:"https://cdn.nekohime.site/file/w1tdk8n1.ogg"
    },

    // Tambahkan lagu berikutnya di sini
    {
      name:"Tony-Q Kalikong",
      url:"https://cdn.nekohime.site/file/3iuvsqxp.ogg"
    },

    {
      name:"PHP - Reggae Cover",
      url:"https://cdn.nekohime.site/file/6uakai76.ogg"
    },    {
      name:"Dhyo how - Tersenyum",
      url:"https://cdn.nekohime.site/file/0hf28h8k.ogg"
    },
    {
      name:"Dwi Tanty - Last Child",
      url:"https://cdn.nekohime.site/file/vfzk2ghi.ogg"
    }

  ]

  let musicIndex = 0

  bgMusic.volume = 0.35

  // =========================
  // LOAD MUSIC
  // =========================

  function loadMusic(index, autoplay = false) {

    if (!musicList.length) return

    musicIndex =
      (index + musicList.length) %
      musicList.length

    const music = musicList[musicIndex]

    bgMusic.src = music.url

    musicName.textContent = music.name

    musicNumber.textContent =
      `${musicIndex + 1} / ${musicList.length}`

    if (autoplay) {
      playMusic()
    } else {
      updateMusicUI()
    }

  }

  // =========================
  // PLAY
  // =========================

  async function playMusic() {

    try {

      await bgMusic.play()

      updateMusicUI()

    } catch (error) {

      console.log(
        "Music belum bisa diputar:",
        error
      )

      updateMusicUI()

    }

  }

  // =========================
  // PAUSE
  // =========================

  function pauseMusic() {

    bgMusic.pause()

    updateMusicUI()

  }

  // =========================
  // UI
  // =========================

  function updateMusicUI() {

    if (bgMusic.paused) {

      musicPlay.textContent = "▶"

      musicStatus.textContent =
        "OFF MUSIC"

      musicStatus.classList.remove("on")

      musicMini.classList.remove("music-on")

    } else {

      musicPlay.textContent = "Ⅱ"

      musicStatus.textContent =
        "ON MUSIC"

      musicStatus.classList.add("on")

      musicMini.classList.add("music-on")

    }

  }

  // =========================
  // PLAY / PAUSE
  // =========================

  musicPlay.addEventListener(
    "click",
    async () => {

      if (bgMusic.paused) {

        await playMusic()

      } else {

        pauseMusic()

      }

    }
  )

  // =========================
  // NEXT
  // =========================

  musicNext.addEventListener(
    "click",
    () => {

      loadMusic(
        musicIndex + 1,
        true
      )

    }
  )

  // =========================
  // PREVIOUS
  // =========================

  musicPrev.addEventListener(
    "click",
    () => {

      loadMusic(
        musicIndex - 1,
        true
      )

    }
  )

  // =========================
  // AUTO NEXT
  // =========================

  bgMusic.addEventListener(
    "ended",
    () => {

      loadMusic(
        musicIndex + 1,
        true
      )

    }
  )

  // =========================
  // UPDATE EVENT
  // =========================

  bgMusic.addEventListener(
    "play",
    updateMusicUI
  )

  bgMusic.addEventListener(
    "pause",
    updateMusicUI
  )

  bgMusic.addEventListener(
    "error",
    () => {

      musicStatus.textContent =
        "MUSIC ERROR"

      musicStatus.classList.remove("on")

      musicMini.classList.remove(
        "music-on"
      )

    }
  )

  // =========================
  // BUKA PLAYER
  // =========================

  musicMini.addEventListener(
    "click",
    () => {

      musicPlayer.classList.toggle("open")

    }
  )

  // =========================
  // TUTUP PLAYER
  // =========================

  if (musicClose) {

    musicClose.addEventListener(
      "click",
      () => {

        musicPlayer.classList.remove(
          "open"
        )

      }
    )

  }

  // =========================
  // DRAG / GESER
  // =========================

  let dragging = false
  let moved = false
  let offsetX = 0
  let offsetY = 0

  musicMini.addEventListener(
    "pointerdown",
    (e) => {

      dragging = true
      moved = false

      const rect =
        musicPlayer.getBoundingClientRect()

      offsetX =
        e.clientX - rect.left

      offsetY =
        e.clientY - rect.top

      musicMini.setPointerCapture(
        e.pointerId
      )

    }
  )

  musicMini.addEventListener(
    "pointermove",
    (e) => {

      if (!dragging) return

      moved = true

      let x =
        e.clientX - offsetX

      let y =
        e.clientY - offsetY

      const maxX =
        window.innerWidth -
        musicPlayer.offsetWidth

      const maxY =
        window.innerHeight -
        musicPlayer.offsetHeight

      x = Math.max(
        0,
        Math.min(x, maxX)
      )

      y = Math.max(
        0,
        Math.min(y, maxY)
      )

      musicPlayer.style.left =
        `${x}px`

      musicPlayer.style.top =
        `${y}px`

      musicPlayer.style.right =
        "auto"

      musicPlayer.style.bottom =
        "auto"

    }
  )

  musicMini.addEventListener(
    "pointerup",
    () => {

      dragging = false

      if (moved) {

        setTimeout(() => {
          moved = false
        }, 100)

      }

    }
  )

  // =========================
  // TOUCH / CLICK PERTAMA
  // =========================

  function firstInteraction() {

    if (bgMusic.paused) {
      playMusic()
    }

    document.removeEventListener(
      "pointerdown",
      firstInteraction
    )

    document.removeEventListener(
      "touchstart",
      firstInteraction
    )

  }

  document.addEventListener(
    "pointerdown",
    firstInteraction,
    {passive:true}
  )

  document.addEventListener(
    "touchstart",
    firstInteraction,
    {passive:true}
  )

  // =========================
  // MULAI
  // =========================

  loadMusic(0, false)
  updateMusicUI()

}

// =========================
// LAPOR DEVELOPER / PESAN
// =========================

const reportModal = document.getElementById("reportModal")
const reportTitle = document.getElementById("reportTitle")
const reportHint = document.getElementById("reportHint")
const reportText = document.getElementById("reportText")
const reportMedia = document.getElementById("reportMedia")
const reportMediaPreview = document.getElementById("reportMediaPreview")
const reportSend = document.getElementById("reportSend")

const REPORT_WHATSAPP = "6287766443103"

let reportType = "developer"
let reportSelectedFile = null
let reportPreviewUrl = null

function formatReportSize(bytes) {
  if (!Number.isFinite(bytes)) return ""

  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function escapeReportHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function clearReportMedia() {
  if (reportPreviewUrl) {
    URL.revokeObjectURL(reportPreviewUrl)
    reportPreviewUrl = null
  }

  reportSelectedFile = null

  if (reportMedia) {
    reportMedia.value = ""
  }

  if (reportMediaPreview) {
    reportMediaPreview.innerHTML = ""
    reportMediaPreview.classList.remove("show")
  }
}

function showReportMedia(file) {
  if (!file) return

  if (reportPreviewUrl) {
    URL.revokeObjectURL(reportPreviewUrl)
    reportPreviewUrl = null
  }

  reportSelectedFile = file

  const isImage = file.type.startsWith("image/")
  const isVideo = file.type.startsWith("video/")

  let preview = ""

  if (isImage || isVideo) {
    reportPreviewUrl = URL.createObjectURL(file)

    preview = isImage
      ? `<img class="report-media-thumb" src="${reportPreviewUrl}" alt="Media laporan">`
      : `<video class="report-media-thumb" src="${reportPreviewUrl}" muted></video>`
  } else {
    preview = `<div class="report-media-thumb" style="display:grid;place-items:center;font-size:24px">📎</div>`
  }

  reportMediaPreview.innerHTML = `
    ${preview}
    <div class="report-media-info">
      <strong>${escapeReportHtml(file.name)}</strong>
      <small>${escapeReportHtml(file.type || "file")} • ${formatReportSize(file.size)}</small>
    </div>
    <button class="report-media-remove" type="button" id="removeReportMedia" aria-label="Hapus media">×</button>
  `

  reportMediaPreview.classList.add("show")

  document
    .getElementById("removeReportMedia")
    ?.addEventListener("click", clearReportMedia)
}

function openReportModal(type = "developer") {
  reportType = type

  const isMessage = type === "message"

  reportTitle.textContent =
    isMessage ? "Lapor Pesan" : "Lapor Developer"

  reportHint.textContent =
    isMessage
      ? "Tulis pesan atau laporan yang ingin disampaikan kepada developer."
      : "Tulis laporan atau masukan untuk developer."

  reportText.placeholder =
    isMessage
      ? "Tulis laporan pesan..."
      : "Tulis laporan..."

  reportText.value = ""
  clearReportMedia()

  reportModal.classList.add("open")
  reportModal.setAttribute("aria-hidden", "false")

  setTimeout(() => {
    reportText.focus()
  }, 50)
}

function closeReportModal() {
  reportModal.classList.remove("open")
  reportModal.setAttribute("aria-hidden", "true")
  reportText.value = ""
  clearReportMedia()
}

async function sendDeveloperReport() {
  const text = reportText.value.trim()

  if (!text && !reportSelectedFile) {
    toast("Tulis laporan atau pilih media terlebih dahulu.")
    reportText.focus()
    return
  }

  const typeLabel =
    reportType === "message"
      ? "Lapor Pesan"
      : "Lapor Developer"

  const reportMessage = [
    `Halo Maxiel Nuoye ོ, saya ingin mengirim ${typeLabel.toLowerCase()}.`,
    "",
    text || "(Tidak ada teks laporan)",
    reportSelectedFile
      ? `\nLampiran: ${reportSelectedFile.name}`
      : ""
  ].join("\n")

  try {
    reportSend.disabled = true
    reportSend.textContent = "…"

    /*
     * wa.me hanya dapat membawa teks melalui ?text=.
     * Jika browser mendukung Web Share API + file, media
     * dibagikan bersama teks agar bisa dipilih ke WhatsApp.
     */
    if (
      reportSelectedFile &&
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files: [reportSelectedFile]
      })
    ) {
      await navigator.share({
        title: typeLabel,
        text: reportMessage,
        files: [reportSelectedFile]
      })

      closeReportModal()
      toast("Laporan siap dibagikan.")
      return
    }

    const whatsappUrl =
      `https://wa.me/${REPORT_WHATSAPP}?text=` +
      encodeURIComponent(reportMessage)

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    )

    closeReportModal()

    if (reportSelectedFile) {
      toast("WhatsApp dibuka. Lampiran perlu dipilih manual.")
    } else {
      toast("Laporan dibuka di WhatsApp.")
    }

  } catch (error) {
    if (error?.name !== "AbortError") {
      console.error("Gagal mengirim laporan:", error)

      const whatsappUrl =
        `https://wa.me/${REPORT_WHATSAPP}?text=` +
        encodeURIComponent(reportMessage)

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      )

      closeReportModal()
      toast("WhatsApp dibuka untuk laporan.")
    }
  } finally {
    reportSend.disabled = false
    reportSend.textContent = "➤"
  }
}

document
  .querySelectorAll("[data-report]")
  .forEach(button => {
    button.addEventListener("click", () => {
      openReportModal(button.dataset.report)
    })
  })

document
  .querySelectorAll("[data-report-close]")
  .forEach(button => {
    button.addEventListener("click", closeReportModal)
  })

reportMedia?.addEventListener(
  "change",
  () => {
    const file = reportMedia.files?.[0]

    if (file) {
      showReportMedia(file)
    }
  }
)

reportSend?.addEventListener(
  "click",
  sendDeveloperReport
)

reportText?.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.isComposing
    ) {
      event.preventDefault()
      sendDeveloperReport()
    }
  }
)

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      reportModal?.classList.contains("open")
    ) {
      closeReportModal()
    }
  }
)

document
  .getElementById("processHDPhoto")
  ?.addEventListener("click", async () => {

    // event foto
  })


// =========================
// HD VIDEO
// =========================

document
  .getElementById("processHDVideo")
  ?.addEventListener("click", async () => {

    // event video
  })
