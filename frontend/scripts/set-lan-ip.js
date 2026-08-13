import os from 'os'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PORT_BACKEND = 5000
const ENV_PATH = path.join(__dirname, '..', '.env')

const MOTS_CLES_IGNORES = ['vpn', 'nord', 'avast', 'tap', 'tun', 'wintun', 'loopback', 'bluetooth', 'virtual', 'hyper-v', 'vmware', 'vbox']
const NOMS_PREFERES = ['wi-fi', 'wifi', 'ethernet', 'réseau local', 'reseau local']

function estAdresseUtile(nomInterface, adresse) {
  if (adresse.internal) return false
  if (adresse.family !== 'IPv4') return false
  if (adresse.address.startsWith('169.254.')) return false
  const nomMinuscule = nomInterface.toLowerCase()
  if (MOTS_CLES_IGNORES.some(mot => nomMinuscule.includes(mot))) return false
  return true
}

function trouverIpLan() {
  const interfaces = os.networkInterfaces()
  const candidats = []

  for (const [nomInterface, adresses] of Object.entries(interfaces)) {
    for (const adresse of adresses || []) {
      if (estAdresseUtile(nomInterface, adresse)) {
        candidats.push({ nomInterface, ip: adresse.address })
      }
    }
  }

  if (candidats.length === 0) return null

  const prefere = candidats.find(c => NOMS_PREFERES.some(nom => c.nomInterface.toLowerCase().includes(nom)))
  return (prefere || candidats[0]).ip
}

function main() {
  const ip = trouverIpLan()

  if (!ip) {
    console.warn('⚠️  Impossible de détecter une IP LAN, .env inchangé (accès mobile risque de ne pas fonctionner)')
    return
  }

  const contenu = `VITE_API_URL=http://${ip}:${PORT_BACKEND}/api\nVITE_SOCKET_URL=http://${ip}:${PORT_BACKEND}\n`

  const ancienContenu = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : ''
  if (ancienContenu === contenu) {
    console.log(`✔ .env déjà à jour (${ip})`)
    return
  }

  fs.writeFileSync(ENV_PATH, contenu)
  console.log(`✔ .env mis à jour avec l'IP LAN détectée : ${ip}`)
  console.log(`  → Accès mobile : http://${ip}:5173`)
}

main()
