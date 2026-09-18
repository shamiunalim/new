const WALLET_API = window.MAXIEL_WALLET_API || ""

const walletTokenKey = "maxiel_wallet_token"

const walletMoney = value => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

async function walletRequest(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  }

  const token = localStorage.getItem(walletTokenKey)

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(WALLET_API + url, {
    ...options,
    headers
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || "Terjadi kesalahan.")
  }

  return data
}

/* =========================
   LOGIN
========================= */

async function walletLogin() {
  try {
    const email = document.querySelector("#walletLoginEmail")?.value.trim()
    const password = document.querySelector("#walletLoginPassword")?.value

    if (!email || !password) {
      return alert("Email dan password wajib diisi.")
    }

    const data = await walletRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password
      })
    })

    localStorage.setItem(walletTokenKey, data.token)

    walletLoad()

    alert("Login wallet berhasil.")
  } catch (e) {
    alert(e.message)
  }
}

/* =========================
   REGISTER
========================= */

async function walletRegister() {
  try {
    const name = document.querySelector("#walletRegisterName")?.value.trim()
    const email = document.querySelector("#walletRegisterEmail")?.value.trim()
    const password = document.querySelector("#walletRegisterPassword")?.value

    if (!name || !email || !password) {
      return alert("Lengkapi semua data.")
    }

    if (password.length < 8) {
      return alert("Password minimal 8 karakter.")
    }

    const data = await walletRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password
      })
    })

    localStorage.setItem(walletTokenKey, data.token)

    walletLoad()

    alert("Akun wallet berhasil dibuat.")
  } catch (e) {
    alert(e.message)
  }
}

/* =========================
   LOAD WALLET
========================= */

async function walletLoad() {
  const token = localStorage.getItem(walletTokenKey)

  if (!token) {
    document.querySelector("#walletAuth")?.removeAttribute("hidden")
    document.querySelector("#walletPanel")?.setAttribute("hidden", "")
    return
  }

  try {
    const data = await walletRequest("/api/wallet/me")

    const user = data.user

    document.querySelector("#walletAuth")?.setAttribute("hidden", "")
    document.querySelector("#walletPanel")?.removeAttribute("hidden")

    const name = document.querySelector("#walletUserName")
    const email = document.querySelector("#walletUserEmail")
    const balance = document.querySelector("#walletBalance")
    const savings = document.querySelector("#walletSavingsBalance")
    const code = document.querySelector("#walletUserCode")

    if (name) name.textContent = user.name
    if (email) email.textContent = user.email
    if (balance) balance.textContent = walletMoney(user.balance)
    if (savings) savings.textContent = walletMoney(user.savings_balance)
    if (code) code.textContent = user.code

    walletTransactions(data.transactions || [])
  } catch (e) {
    localStorage.removeItem(walletTokenKey)
    alert(e.message)
  }
}

/* =========================
   TOPUP
========================= */

async function walletTopup() {
  try {
    const amount = Number(
      document.querySelector("#walletTopupAmount")?.value
    )

    const channel =
      document.querySelector("#walletTopupMethod")?.value || "QRIS"

    if (!Number.isInteger(amount) || amount < 1000) {
      return alert("Minimal topup Rp1.000.")
    }

    const data = await walletRequest("/api/wallet/topup", {
      method: "POST",
      body: JSON.stringify({
        amount,
        channel
      })
    })

    if (data.checkout_url) {
      window.open(data.checkout_url, "_blank")
    }

    alert(
      `Topup dibuat.\n\n` +
      `Nominal: ${walletMoney(data.amount)}\n` +
      `Referensi: ${data.reference_id}`
    )

    walletLoad()
  } catch (e) {
    alert(e.message)
  }
}

/* =========================
   TRANSFER
========================= */

async function walletTransfer() {
  try {
    const recipient =
      document.querySelector("#walletTransferEmail")?.value.trim()

    const amount =
      Number(document.querySelector("#walletTransferAmount")?.value)

    const note =
      document.querySelector("#walletTransferNote")?.value.trim()

    if (!recipient || !Number.isInteger(amount) || amount < 1000) {
      return alert("Penerima dan nominal tidak valid.")
    }

    await walletRequest("/api/wallet/transfer", {
      method: "POST",
      body: JSON.stringify({
        recipient,
        amount,
        note
      })
    })

    alert("Transfer berhasil.")

    walletLoad()
  } catch (e) {
    alert(e.message)
  }
}

/* =========================
   TABUNG
========================= */

async function walletSave() {
  try {
    const amount =
      Number(document.querySelector("#walletSaveAmount")?.value)

    if (!Number.isInteger(amount) || amount < 1000) {
      return alert("Nominal tidak valid.")
    }

    await walletRequest("/api/wallet/savings/deposit", {
      method: "POST",
      body: JSON.stringify({
        amount
      })
    })

    alert("Uang berhasil ditabung.")

    walletLoad()
  } catch (e) {
    alert(e.message)
  }
}

/* =========================
   AMBIL TABUNGAN
========================= */

async function walletWithdrawSavings() {
  try {
    const amount =
      Number(document.querySelector("#walletSaveAmount")?.value)

    if (!Number.isInteger(amount) || amount < 1000) {
      return alert("Nominal tidak valid.")
    }

    await walletRequest("/api/wallet/savings/withdraw", {
      method: "POST",
      body: JSON.stringify({
        amount
      })
    })

    alert("Uang berhasil dikembalikan ke saldo wallet.")

    walletLoad()
  } catch (e) {
    alert(e.message)
  }
}

/* =========================
   LOGOUT
========================= */

function walletLogout() {
  localStorage.removeItem(walletTokenKey)

  document.querySelector("#walletAuth")?.removeAttribute("hidden")
  document.querySelector("#walletPanel")?.setAttribute("hidden", "")

  alert("Berhasil keluar.")
}

/* =========================
   RIWAYAT
========================= */

function walletTransactions(items) {
  const box = document.querySelector("#walletTransactions")

  if (!box) return

  if (!items.length) {
    box.innerHTML = `
      <div class="wallet-empty">
        Belum ada transaksi.
      </div>
    `
    return
  }

  box.innerHTML = items.map(tx => {

    const incoming = [
      "TOPUP",
      "TRANSFER_IN",
      "SAVINGS_WITHDRAW"
    ].includes(tx.type)

    return `
      <div class="wallet-transaction">
        <div>
          <b>${tx.label || tx.type}</b>
          <small>${tx.created_at || ""}</small>
        </div>

        <strong class="${incoming ? "wallet-in" : "wallet-out"}">
          ${incoming ? "+" : "-"}${walletMoney(tx.amount)}
        </strong>
      </div>
    `

  }).join("")
}

/* =========================
   EVENTS
========================= */

document.addEventListener("DOMContentLoaded", () => {

  document
    .querySelector("#walletLoginBtn")
    ?.addEventListener("click", walletLogin)

  document
    .querySelector("#walletRegisterBtn")
    ?.addEventListener("click", walletRegister)

  document
    .querySelector("#walletTopupBtn")
    ?.addEventListener("click", walletTopup)

  document
    .querySelector("#walletTransferBtn")
    ?.addEventListener("click", walletTransfer)

  document
    .querySelector("#walletSaveBtn")
    ?.addEventListener("click", walletSave)

  document
    .querySelector("#walletWithdrawSavingsBtn")
    ?.addEventListener(
      "click",
      walletWithdrawSavings
    )

  document
    .querySelector("#walletLogoutBtn")
    ?.addEventListener("click", walletLogout)

  walletLoad()
})