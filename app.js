import { API, TIKTOK_API } from "./api.js"

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

  const dashboardTime = document.getElementById("dashboardTime")
  if (dashboardTime) {
    dashboardTime.textContent = time.replaceAll(":", ".")
  }
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


// =========================================================
// MAXIEL SETTINGS / THEME + SPECIFIC COLORS
// =========================================================
const maxielThemeKey = "maxiel_theme"
const maxielColorsKey = "maxiel_dashboard_colors"
const themeStatus = document.getElementById("themeStatus")
const colorStatus = document.getElementById("colorStatus")
const resetSettings = document.getElementById("resetSettings")

const colorInputs = {
  accent: document.getElementById("accentColor"),
  background: document.getElementById("dashboardBgColor"),
  topbar: document.getElementById("topbarColor"),
  sidebar: document.getElementById("sidebarColor"),
  card: document.getElementById("cardColor"),
  text: document.getElementById("textColor")
}

const defaultDashboardColors = {
  accent: "#087cff",
  background: "#020817",
  topbar: "#010712",
  sidebar: "#020c1c",
  card: "#03202e",
  text: "#f4f7ff"
}

function hexToRgba(hex, alpha = .18) {
  const value = String(hex).replace("#", "")
  const full = value.length === 3
    ? value.split("").map(x => x + x).join("")
    : value
  const number = Number.parseInt(full, 16)
  if (!Number.isFinite(number)) return `rgba(8,124,255,${alpha})`
  const r = (number >> 16) & 255
  const g = (number >> 8) & 255
  const b = number & 255
  return `rgba(${r},${g},${b},${alpha})`
}

function isHex(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value))
}

function normalizeDashboardColors(colors = {}) {
  const result = {}
  for (const [key, fallback] of Object.entries(defaultDashboardColors)) {
    result[key] = isHex(colors[key])
      ? String(colors[key]).toLowerCase()
      : fallback
  }
  return result
}

function applyDashboardColors(colors, save = true) {
  const safe = normalizeDashboardColors(colors)
  const root = document.body.style

  root.setProperty("--accent", safe.accent)
  root.setProperty("--accent-soft", hexToRgba(safe.accent, .18))
  root.setProperty("--dashboard-bg", safe.background)
  root.setProperty("--topbar-bg", hexToRgba(safe.topbar, .94))
  root.setProperty("--sidebar-bg", hexToRgba(safe.sidebar, .96))
  root.setProperty("--card-bg", hexToRgba(safe.card, .78))
  root.setProperty("--text-main", safe.text)

  Object.entries(colorInputs).forEach(([key, input]) => {
    if (input) input.value = safe[key]
  })

  if (colorStatus) {
    colorStatus.textContent = safe.accent.toUpperCase()
  }

  document.querySelectorAll(".color-preset").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.color?.toLowerCase() === safe.accent
    )
  })

  if (save) {
    localStorage.setItem(maxielColorsKey, JSON.stringify(safe))
  }
}

function getCurrentDashboardColors() {
  const result = {}
  for (const [key, input] of Object.entries(colorInputs)) {
    result[key] = input?.value || defaultDashboardColors[key]
  }
  return normalizeDashboardColors(result)
}

function applyMaxielTheme(theme, save = true) {
  const safe = ["blue", "original"].includes(theme)
    ? theme
    : "blue"

  document.body.classList.remove(
    "theme-blue",
    "theme-original"
  )
  document.body.classList.add(`theme-${safe}`)

  if (themeStatus) {
    themeStatus.textContent = safe === "original"
      ? "MAXIEL NEW"
      : "BLUE"
  }

  document.querySelectorAll(".theme-option").forEach(button => {
    button.classList.toggle(
      "selected",
      button.dataset.theme === safe
    )
  })

  if (save) {
    localStorage.setItem(maxielThemeKey, safe)
  }
}

document.querySelectorAll(".theme-option").forEach(button => {
  button.addEventListener("click", () => {
    applyMaxielTheme(button.dataset.theme)
    toast(`Background ${button.textContent.trim().split("\n")[0]} diterapkan.`)
  })
})

Object.entries(colorInputs).forEach(([key, input]) => {
  input?.addEventListener("input", event => {
    const colors = getCurrentDashboardColors()
    colors[key] = event.target.value
    applyDashboardColors(colors)
    toast(`Warna ${key} langsung diterapkan.`)
  })
})

document.querySelectorAll(".color-preset").forEach(button => {
  button.addEventListener("click", () => {
    const colors = getCurrentDashboardColors()
    colors.accent = button.dataset.color
    applyDashboardColors(colors)
    toast(`Warna menu aktif ${button.dataset.color.toUpperCase()} diterapkan.`)
  })
})

resetSettings?.addEventListener("click", () => {
  localStorage.removeItem(maxielThemeKey)
  localStorage.removeItem(maxielColorsKey)
  applyMaxielTheme("blue", false)
  applyDashboardColors(defaultDashboardColors, false)
  toast("Semua pengaturan warna dikembalikan ke default.")
})

let savedColors = defaultDashboardColors
try {
  const stored = JSON.parse(
    localStorage.getItem(maxielColorsKey) || "null"
  )
  if (stored && typeof stored === "object") {
    savedColors = normalizeDashboardColors(stored)
  }
} catch {}

const savedTheme = localStorage.getItem(maxielThemeKey)
applyMaxielTheme(
  savedTheme === "original" ? "original" : "blue",
  false
)
applyDashboardColors(savedColors, false)

// =========================================================
// MAXIEL TUTORIAL VIDEO PLAYER
// =========================================================

const tutorialVideo = document.getElementById("tutorialVideo")
const tutorialVideoWrap = document.querySelector(".tutorial-video-wrap")
const tutorialPlay = document.getElementById("tutorialPlay")
const tutorialBigPlay = document.getElementById("tutorialBigPlay")
const tutorialMute = document.getElementById("tutorialMute")
const tutorialProgress = document.getElementById("tutorialProgress")
const tutorialCurrentTime = document.getElementById("tutorialCurrentTime")
const tutorialDuration = document.getElementById("tutorialDuration")
const tutorialFullscreen = document.getElementById("tutorialFullscreen")
const tutorialSpeedButton = document.getElementById("tutorialSpeedButton")
const tutorialSpeed = document.querySelector(".tutorial-speed")
const tutorialSpeedMenu = document.getElementById("tutorialSpeedMenu")
const tutorialLoading = document.getElementById("tutorialVideoLoading")

if (tutorialVideo) {

  function tutorialFormatTime(seconds) {
    if (!Number.isFinite(seconds)) {
      return "00:00"
    }

    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  function updateTutorialPlayUI() {

    const playing =
      !tutorialVideo.paused &&
      !tutorialVideo.ended

    if (tutorialPlay) {
      tutorialPlay.textContent =
        playing ? "Ⅱ" : "▶"
    }

    tutorialVideoWrap?.classList.toggle(
      "playing",
      playing
    )
  }

  function toggleTutorialPlay() {

    if (tutorialVideo.paused) {
      tutorialVideo.play().catch(error => {
        console.error(
          "Tutorial video tidak dapat diputar:",
          error
        )
      })
    } else {
      tutorialVideo.pause()
    }

  }

  // PLAY / PAUSE
  tutorialPlay?.addEventListener(
    "click",
    toggleTutorialPlay
  )

  tutorialBigPlay?.addEventListener(
    "click",
    toggleTutorialPlay
  )

  // Klik video untuk play / pause
  tutorialVideo.addEventListener(
    "click",
    toggleTutorialPlay
  )

  // STATUS PLAY
  tutorialVideo.addEventListener(
    "play",
    updateTutorialPlayUI
  )

  // STATUS PAUSE
  tutorialVideo.addEventListener(
    "pause",
    updateTutorialPlayUI
  )

  // VIDEO SELESAI
  tutorialVideo.addEventListener(
    "ended",
    () => {

      updateTutorialPlayUI()

      if (tutorialProgress) {
        tutorialProgress.value = 0
      }

    }
  )

  // DATA VIDEO SIAP
  tutorialVideo.addEventListener(
    "loadedmetadata",
    () => {

      if (tutorialDuration) {
        tutorialDuration.textContent =
          tutorialFormatTime(
            tutorialVideo.duration
          )
      }

      if (tutorialProgress) {
        tutorialProgress.max =
          tutorialVideo.duration || 0

        tutorialProgress.value = 0
      }

    }
  )

  // UPDATE WAKTU
  tutorialVideo.addEventListener(
    "timeupdate",
    () => {

      if (!tutorialVideo.duration) {
        return
      }

      if (tutorialCurrentTime) {
        tutorialCurrentTime.textContent =
          tutorialFormatTime(
            tutorialVideo.currentTime
          )
      }

      if (tutorialProgress) {
        tutorialProgress.value =
          tutorialVideo.currentTime
      }

    }
  )

  // SEEK VIDEO
  tutorialProgress?.addEventListener(
    "input",
    () => {

      tutorialVideo.currentTime =
        Number(
          tutorialProgress.value
        )

    }
  )

  // MUTE
  tutorialMute?.addEventListener(
    "click",
    () => {

      tutorialVideo.muted =
        !tutorialVideo.muted

      tutorialMute.textContent =
        tutorialVideo.muted
          ? "🔇"
          : "🔊"

    }
  )

  // SPEED MENU
  tutorialSpeedButton?.addEventListener(
    "click",
    event => {

      event.stopPropagation()

      tutorialSpeed?.classList.toggle(
        "open"
      )

    }
  )

  // PILIH SPEED
  tutorialSpeedMenu
    ?.querySelectorAll("button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const speed =
            Number(
              button.dataset.speed
            )

          if (!Number.isFinite(speed)) {
            return
          }

          tutorialVideo.playbackRate =
            speed

          if (tutorialSpeedButton) {
            tutorialSpeedButton.textContent =
              `${speed}×`
          }

          tutorialSpeedMenu
            .querySelectorAll("button")
            .forEach(item => {
              item.classList.remove("active")
            })

          button.classList.add("active")

          tutorialSpeed?.classList.remove(
            "open"
          )

        }
      )

    })

  // TUTUP MENU SPEED KETIKA KLIK DI LUAR
  document.addEventListener(
    "click",
    event => {

      if (
        tutorialSpeed &&
        !tutorialSpeed.contains(event.target)
      ) {
        tutorialSpeed.classList.remove(
          "open"
        )
      }

    }
  )

  // FULLSCREEN
  tutorialFullscreen?.addEventListener(
    "click",
    async () => {

      try {

        if (document.fullscreenElement) {

          await document.exitFullscreen()

        } else if (
          tutorialVideoWrap?.requestFullscreen
        ) {

          await tutorialVideoWrap.requestFullscreen()

        } else if (
          tutorialVideo.webkitEnterFullscreen
        ) {

          tutorialVideo.webkitEnterFullscreen()

        }

      } catch (error) {

        console.error(
          "Fullscreen tutorial:",
          error
        )

      }

    }
  )

  // LOADING
  tutorialVideo.addEventListener(
    "waiting",
    () => {

      tutorialLoading?.classList.add(
        "show"
      )

    }
  )

  tutorialVideo.addEventListener(
    "playing",
    () => {

      tutorialLoading?.classList.remove(
        "show"
      )

    }
  )

  tutorialVideo.addEventListener(
    "canplay",
    () => {

      tutorialLoading?.classList.remove(
        "show"
      )

    }
  )

  // ERROR
  tutorialVideo.addEventListener(
    "error",
    () => {

      tutorialLoading?.classList.remove(
        "show"
      )

      toast(
        "Video tutorial gagal dimuat."
      )

      console.error(
        "Video tutorial gagal dimuat."
      )

    }
  )

  // DEFAULT SPEED
  tutorialVideo.playbackRate = 1

  // DEFAULT ICON
  updateTutorialPlayUI()

}

// =========================================================
// WEBSITE IDENTITY / PWA / CUSTOM APP ICON
// =========================================================
const webIdentityNameKey = "maxiel_web_identity_name"
const webIdentityIconKey = "maxiel_web_identity_icon"
const webIdentityInstallKey = "maxiel_web_identity_install"
const defaultWebIdentityName = "Maxiel"
const defaultWebIdentityIcon = "icon-192.png"

const appNameInput = document.getElementById("appNameInput")
const appIconFile = document.getElementById("appIconFile")
const appIconPreview = document.getElementById("appIconPreview")
const appNamePreview = document.getElementById("appNamePreview")
const appIdentityStatus = document.getElementById("appIdentityStatus")
const appInstallPreview = document.getElementById("appInstallPreview")
const saveAppIdentity = document.getElementById("saveAppIdentity")
const resetAppIdentity = document.getElementById("resetAppIdentity")
const allowAppInstall = document.getElementById("allowAppInstall")
const installAppButton = document.getElementById("installAppButton")
const favicon = document.getElementById("favicon")
const appleIcon = document.getElementById("appleIcon")
const appManifest = document.getElementById("appManifest")
const applicationNameMeta = document.getElementById("applicationNameMeta")
const appleAppTitleMeta = document.getElementById("appleAppTitleMeta")
const siteDescription = document.getElementById("siteDescription")
const webIdentityLogo = document.getElementById("webIdentityLogo")
const webIdentitySideLogo = document.getElementById("webIdentitySideLogo")
const aiAvatarImage = document.getElementById("aiAvatarImage")

let deferredInstallPrompt = null

function cleanWebIdentityName(value) {
  const name = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40)

  return name || defaultWebIdentityName
}

function getWebIdentityName() {
  return cleanWebIdentityName(
    localStorage.getItem(webIdentityNameKey) ||
    defaultWebIdentityName
  )
}

function getWebIdentityIcon() {
  return localStorage.getItem(webIdentityIconKey) || defaultWebIdentityIcon
}

function getStoredAppIconSet() {
  try {
    const raw = localStorage.getItem("maxiel_web_identity_icons")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getWebIdentityIcons() {
  const stored = getStoredAppIconSet()
  if (stored?.icon192 && stored?.icon512) return stored

  const icon = getWebIdentityIcon()
  return {
    icon192: icon,
    icon512: icon
  }
}

function applyWebIdentityText(name) {
  const safeName = cleanWebIdentityName(name)
  const upperName = safeName.toUpperCase()

  document.querySelectorAll("[data-web-name]").forEach(el => {
    el.textContent = safeName
  })

  document.querySelectorAll("[data-web-full]").forEach(el => {
    el.textContent = `${safeName} Web`
  })

  document.title = safeName

  if (applicationNameMeta) {
    applicationNameMeta.content = safeName
  }

  if (appleAppTitleMeta) {
    appleAppTitleMeta.content = safeName
  }

  if (siteDescription) {
    siteDescription.content =
      `${safeName} Web - Downloader, Converter & Tools`
  }

  // Semua label brand yang memang ditulis sebagai MAXIEL ikut berubah.
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT
  )

  const nodes = []
  while (walker.nextNode()) {
    nodes.push(walker.currentNode)
  }

  nodes.forEach(node => {
    const parent = node.parentElement
    if (!parent) return
    if (
      parent.closest("script,style,input,textarea,select") ||
      parent.hasAttribute("data-brand-ignore")
    ) {
      return
    }

    if (node.nodeValue.includes("MAXIEL")) {
      node.nodeValue = node.nodeValue.replaceAll("MAXIEL", upperName)
    }
  })
}

function applyWebIdentityIcon(icon) {
  const safeIcon = icon || defaultWebIdentityIcon

  // Satu foto identitas yang dipilih di Pengaturan dipakai bersama
  // untuk ikon aplikasi, logo website, favicon, dan avatar AI.
  if (favicon) favicon.href = safeIcon
  if (appleIcon) appleIcon.href = safeIcon

  if (appIconPreview) appIconPreview.src = safeIcon
  if (webIdentityLogo) webIdentityLogo.src = safeIcon
  if (webIdentitySideLogo) webIdentitySideLogo.src = safeIcon
  if (aiAvatarImage) aiAvatarImage.src = safeIcon
}

function getCurrentSiteInfo() {
  const url = new URL(window.location.href)
  // Gunakan direktori halaman saat ini sebagai root aplikasi.
  // Ini otomatis bekerja untuk user site maupun project site GitHub Pages.
  const baseUrl = new URL(".", url.href)
  baseUrl.hash = ""
  baseUrl.search = ""

  const cleanPath = url.pathname.replace(/^\/+|\/+$/g, "")
  const segments = cleanPath ? cleanPath.split("/").filter(Boolean) : []
  let repository = "Root / User Site"

  if (url.hostname.endsWith(".github.io") && segments.length) {
    repository = segments[0]
  } else if (segments.length) {
    repository = segments[0]
  }

  const pageName = cleanWebIdentityName(
    document.title ||
    document.querySelector('meta[name="application-name"]')?.content ||
    defaultWebIdentityName
  )

  return {
    siteUrl: baseUrl.href,
    repository,
    pageName
  }
}

function updateCurrentSiteInfo() {
  const info = getCurrentSiteInfo()
  return info
}

async function buildDynamicManifest(name, icon) {
  if (!appManifest) return

  const icons = getWebIdentityIcons()
  const siteInfo = updateCurrentSiteInfo()
  const siteUrl = siteInfo.siteUrl
  const manifest = {
    name: cleanWebIdentityName(name),
    short_name: cleanWebIdentityName(name).slice(0, 12),
    id: siteUrl,
    lang: "id",
    description: `${cleanWebIdentityName(name)} Web - Downloader, Converter & Tools`,
    start_url: siteUrl,
    scope: siteUrl,
    display: "standalone",
    display_override: ["standalone", "fullscreen"],
    orientation: "portrait-primary",
    background_color: "#020817",
    theme_color: "#020817",
    prefer_related_applications: false,
    icons: [
      {
        src: icons.icon192 || icon,
        sizes: "192x192",
        type: String(icons.icon192 || icon).startsWith("data:image/png") ? "image/png" : "image/jpeg",
        purpose: "any"
      },
      {
        src: icons.icon512 || icon,
        sizes: "512x512",
        type: String(icons.icon512 || icon).startsWith("data:image/png") ? "image/png" : "image/jpeg",
        purpose: "any maskable"
      }
    ]
  }

  try {
    // Gunakan Data URL supaya manifest berisi nama + ikon pilihan perangkat
    // saat dialog install dibuka. Static manifest tetap menjadi fallback.
    const manifestUrl =
      "data:application/manifest+json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(manifest))

    appManifest.href = manifestUrl
    window.__maxielManifestUrl = manifestUrl
  } catch (error) {
    console.warn("Manifest dinamis tidak tersedia:", error)
  }
}

function updateAppIdentityUI() {
  const name = getWebIdentityName()
  const icon = getWebIdentityIcon()
  const allowed =
    localStorage.getItem(webIdentityInstallKey) !== "false"

  applyWebIdentityText(name)
  applyWebIdentityIcon(icon)

  if (appNameInput) appNameInput.value = name
  if (appNamePreview) appNamePreview.textContent = name
  if (appIdentityStatus) appIdentityStatus.textContent = name.toUpperCase().slice(0, 18)
  if (allowAppInstall) allowAppInstall.checked = allowed

  if (appInstallPreview) {
    appInstallPreview.textContent =
      allowed
        ? "Siap dipasang sebagai aplikasi"
        : "Pemasangan aplikasi dinonaktifkan"
  }

  if (installAppButton) {
    // Tampilkan tombol meskipun Chrome belum mengirim beforeinstallprompt.
    // Pada kondisi itu tombol akan memberikan langkah pemasangan manual.
    installAppButton.hidden = !allowed
  }

  // Tampilkan situs/repository/page yang sedang digunakan secara otomatis.
  updateCurrentSiteInfo()

  // Penting: manifest install harus memakai identitas yang tersimpan,
  // sekaligus root situs yang sedang dibuka, bukan origin root yang salah.
  buildDynamicManifest(name, icon)
}

function readSelectedIcon(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null)
      return
    }

    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      reject(new Error("Format foto harus PNG, JPG atau WEBP."))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Ukuran foto ikon maksimal 5 MB."))
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        try {
          const makeIcon = size => {
            const canvas = document.createElement("canvas")
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext("2d")
            ctx.clearRect(0, 0, size, size)

            // Crop ke bentuk kotak tanpa merusak rasio foto.
            const sourceSize = Math.min(image.naturalWidth, image.naturalHeight)
            const sx = (image.naturalWidth - sourceSize) / 2
            const sy = (image.naturalHeight - sourceSize) / 2
            ctx.drawImage(
              image,
              sx, sy, sourceSize, sourceSize,
              0, 0, size, size
            )

            return canvas.toDataURL("image/png")
          }

          resolve({
            icon192: makeIcon(192),
            icon512: makeIcon(512)
          })
        } catch (error) {
          reject(new Error("Foto ikon gagal diproses."))
        }
      }
      image.onerror = () => reject(new Error("Foto ikon tidak dapat dibaca."))
      image.src = reader.result
    }
    reader.onerror = () => reject(new Error("Foto ikon gagal dibaca."))
    reader.readAsDataURL(file)
  })
}

appIconFile?.addEventListener("change", async () => {
  const file = appIconFile.files?.[0]
  if (!file) return

  try {
    const data = await readSelectedIcon(file)
    if (data?.icon512 && appIconPreview) {
      appIconPreview.src = data.icon512
      appInstallPreview.textContent = "Foto ikon siap disimpan"
    }
  } catch (error) {
    appIconFile.value = ""
    toast(error.message)
  }
})

saveAppIdentity?.addEventListener("click", async () => {
  const name = cleanWebIdentityName(appNameInput?.value)
  let icons = getWebIdentityIcons()

  try {
    const file = appIconFile?.files?.[0]
    if (file) {
      icons = await readSelectedIcon(file)
    }
  } catch (error) {
    toast(error.message)
    return
  }

  localStorage.setItem(webIdentityNameKey, name)
  localStorage.setItem(webIdentityIconKey, icons.icon512)
  localStorage.setItem("maxiel_web_identity_icons", JSON.stringify(icons))
  localStorage.setItem(
    webIdentityInstallKey,
    allowAppInstall?.checked === false ? "false" : "true"
  )

  updateWebIdentityManifestAndUI(name, icons.icon512)
  toast(`Identitas ${name} berhasil disimpan.`)

  if (appIconFile) appIconFile.value = ""

  // Muat ulang setelah identitas disimpan agar Chrome membaca manifest
  // dinamis yang baru sebelum membuat dialog pemasangan PWA.
  setTimeout(() => location.reload(), 700)
})

function updateWebIdentityManifestAndUI(name, icon) {
  const safeName = cleanWebIdentityName(name)
  applyWebIdentityText(safeName)
  applyWebIdentityIcon(icon)

  if (appNameInput) appNameInput.value = safeName
  if (appNamePreview) appNamePreview.textContent = safeName
  if (appIdentityStatus) {
    appIdentityStatus.textContent = safeName.toUpperCase().slice(0, 18)
  }

  const allowed =
    localStorage.getItem(webIdentityInstallKey) !== "false"

  if (appInstallPreview) {
    appInstallPreview.textContent =
      allowed
        ? "Siap dipasang sebagai aplikasi"
        : "Pemasangan aplikasi dinonaktifkan"
  }

  if (installAppButton) {
    // Tampilkan tombol meskipun Chrome belum mengirim beforeinstallprompt.
    // Pada kondisi itu tombol akan memberikan langkah pemasangan manual.
    installAppButton.hidden = !allowed
  }

  // Segarkan manifest setelah nama/ikon disimpan agar dialog install
  // membaca identitas terbaru, bukan Maxiel dari manifest default.
  buildDynamicManifest(safeName, icon)

  // beforeinstallprompt yang sudah dibuat sebelum perubahan manifest dapat
  // masih membawa metadata lama. Buang prompt lama; browser akan membuat
  // prompt baru setelah manifest dinamis dibaca ulang.
  deferredInstallPrompt = null
}

allowAppInstall?.addEventListener("change", () => {
  localStorage.setItem(
    webIdentityInstallKey,
    allowAppInstall.checked ? "true" : "false"
  )

  updateWebIdentityManifestAndUI(
    getWebIdentityName(),
    getWebIdentityIcon()
  )
})

resetAppIdentity?.addEventListener("click", () => {
  localStorage.removeItem(webIdentityNameKey)
  localStorage.removeItem(webIdentityIconKey)
  localStorage.removeItem("maxiel_web_identity_icons")
  localStorage.removeItem(webIdentityInstallKey)

  if (appNameInput) appNameInput.value = defaultWebIdentityName
  if (appIconFile) appIconFile.value = ""

  applyWebIdentityIcon(defaultWebIdentityIcon)
  updateWebIdentityManifestAndUI(
    defaultWebIdentityName,
    defaultWebIdentityIcon
  )

  toast("Nama dan ikon kembali ke default.")
})

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault()
  deferredInstallPrompt = event

  const allowed =
    localStorage.getItem(webIdentityInstallKey) !== "false"

  if (installAppButton) {
    installAppButton.hidden = !allowed
  }
})

installAppButton?.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    toast("Di Chrome Android: tekan ⋮ > Tambahkan ke layar utama / Instal aplikasi.")
    return
  }

  deferredInstallPrompt.prompt()

  try {
    await deferredInstallPrompt.userChoice
  } catch {}

  deferredInstallPrompt = null
  installAppButton.hidden = true
})

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null
  if (installAppButton) installAppButton.hidden = true
  toast("Aplikasi berhasil dipasang.")
})

// Terapkan identitas sebelum pengguna berinteraksi dengan website.
updateAppIdentityUI()

// SERVICE WORKER / PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(error => {
        console.warn("Service worker belum aktif:", error)
      })
  })
}

// =========================
// =========================
// MAXIEL AI
// =========================
const aiForm = document.getElementById("aiForm")
const aiInput = document.getElementById("aiInput")
const aiMessages = document.getElementById("aiMessages")
const aiTyping = document.getElementById("aiTyping")
const aiSend = document.getElementById("aiSend")
const clearAIChat = document.getElementById("clearAIChat")
const aiProviderStatus = document.getElementById("aiProviderStatus")
const resetAIProvider = document.getElementById("resetAIProvider")
const aiProviderKey = "maxiel_ai_provider"
const gptOssWorkerUrl = "https://maxiel.shamiunaje.workers.dev/api/ai"
const maxielAIWorkerUrl = "https://maxiel-ganteng.shamiunaje.workers.dev/api/ai"

function getAIProvider() {
  const stored = localStorage.getItem(aiProviderKey)

  // Versi lama: publicai = maxiel-ganteng, fromscratch = GPT-OSS.
  if (stored === "publicai") return "maxiel"
  if (stored === "fromscratch") return "gptoss"

  // Default baru: Worker GPT-OSS FromScratch.
  return stored === "maxiel" || stored === "gptoss" ? stored : "gptoss"
}

function getAIProviderLabel(provider = getAIProvider()) {
  return provider === "maxiel" ? "MAXIEL AI" : "GPT-OSS 120B"
}

function syncAIProviderUI() {
  const provider = getAIProvider()

  document.querySelectorAll("[data-ai-provider]").forEach(button => {
    button.classList.toggle("active", button.dataset.aiProvider === provider)
  })

  if (aiProviderStatus) {
    aiProviderStatus.textContent = getAIProviderLabel(provider)
  }

  const name = getWebIdentityName()
  if (aiTyping) {
    aiTyping.innerHTML = `<span></span><span></span><span></span> ${provider === "maxiel" ? name + " AI" : "GPT-OSS 120B"} sedang mengetik...`
  }
}

function setAIProvider(provider) {
  const safeProvider = provider === "maxiel" ? "maxiel" : "gptoss"
  localStorage.setItem(aiProviderKey, safeProvider)
  syncAIProviderUI()
  toast(`AI respons diubah ke ${getAIProviderLabel(safeProvider)}.`)
}

document.querySelectorAll("[data-ai-provider]").forEach(button => {
  button.addEventListener("click", () => setAIProvider(button.dataset.aiProvider))
})

resetAIProvider?.addEventListener("click", () => {
  localStorage.setItem(aiProviderKey, "gptoss")
  syncAIProviderUI()
  toast("AI respons kembali ke GPT-OSS 120B.")
})

function syncAIIdentity() {
  const name = getWebIdentityName()
  document.querySelectorAll("[data-ai-greeting-name]").forEach(el => {
    el.textContent = name
  })
  if (aiInput) {
    aiInput.placeholder = `Tulis pesan untuk ${name} AI...`
  }
}

let aiWaiting = false
syncAIIdentity()
syncAIProviderUI()

function aiTime(){
  return new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})
}

function addAIMessage(text,type){
  const bubble=document.createElement("div")
  bubble.className=`ai-bubble ${type === "user" ? "ai-user" : "ai-bot"}`
  const body=document.createElement("div")
  body.textContent=text
  const time=document.createElement("time")
  time.textContent=aiTime()
  bubble.append(body,time)
  aiMessages.appendChild(bubble)
  aiMessages.scrollTop=aiMessages.scrollHeight
}

async function askMaxielAI(query){
  const provider = getAIProvider()
  const url = provider === "maxiel"
    ? `${maxielAIWorkerUrl}?query=${encodeURIComponent(query)}`
    : `${gptOssWorkerUrl}?query=${encodeURIComponent(query)}`

  const response=await fetch(url,{method:"GET",headers:{Accept:"application/json"},cache:"no-store"})
  if(!response.ok){
    const detail=await response.text()
    throw new Error(`AI HTTP ${response.status}\n${detail.slice(0,1000)}`)
  }
  const result=await response.json()
  const answer =
    result?.data?.response ??
    result?.data?.answer ??
    result?.response ??
    result?.answer ??
    result?.data?.text ??
    result?.text

  if (typeof answer !== "string" || !answer.trim()) {
    throw new Error("Respons AI kosong atau format respons berubah")
  }

  return answer.trim()
}

async function sendAIMessage(){
  if(aiWaiting) return
  const query=aiInput.value.trim()
  if(!query) return

  aiWaiting=true
  aiSend.disabled=true
  aiInput.disabled=true
  aiTyping.classList.add("show")

  // Tampilkan pesan pengguna terlebih dahulu.
  addAIMessage(query,"user")
  aiInput.value=""
  aiInput.style.height="auto"
  aiMessages.scrollTop=aiMessages.scrollHeight

  try{
    // Tunggu sampai API benar-benar memberikan respons.
    const answer=await askMaxielAI(query)
    addAIMessage(answer,"bot")
  }catch(error){
    console.error("Maxiel AI:",error)
    addAIMessage("Maaf, Maxiel AI sedang mengalami masalah. Coba lagi beberapa saat lagi.","bot")
  }finally{
    aiTyping.classList.remove("show")
    aiInput.disabled=false
    aiSend.disabled=false
    aiWaiting=false
    aiInput.focus()
  }
}

if(aiForm){
  aiForm.addEventListener("submit",e=>{
    e.preventDefault()
    e.stopImmediatePropagation()
    sendAIMessage()
  })
}

if(aiSend){
  aiSend.type="button"
  aiSend.addEventListener("click",e=>{
    e.preventDefault()
    e.stopPropagation()
    sendAIMessage()
  })
}

if(aiInput){
  aiInput.addEventListener("input",()=>{
    aiInput.style.height="auto"
    aiInput.style.height=Math.min(aiInput.scrollHeight,120)+"px"
  })
  aiInput.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&!e.shiftKey){
      e.preventDefault()
      e.stopPropagation()
      sendAIMessage()
    }
  })
}

if(clearAIChat){
  clearAIChat.type="button"
  clearAIChat.addEventListener("click",e=>{
    e.preventDefault()
    e.stopPropagation()
    if(aiWaiting) return
    aiMessages.innerHTML=""
    addAIMessage(`Chat dibersihkan. Halo 👋 Saya ${getWebIdentityName()} AI. Ada yang bisa saya bantu?`,"bot")
  })
}
