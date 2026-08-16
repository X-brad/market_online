import os from 'os'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RACINE_PROJET = path.join(__dirname, '..', '..')

const PORT_BACKEND = 5000
const ENV_PATH = path.join(__dirname, '..', '.env')
const MKCERT_PATH = path.join(RACINE_PROJET, '.tools', 'mkcert.exe')
const CERT_DIR = path.join(RACINE_PROJET, 'certs')
const DERNIERE_IP_PATH = path.join(CERT_DIR, '.last-ip')

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

function regenererCertificatSiNecessaire(ip) {
  if (!fs.existsSync(MKCERT_PATH)) return

  const derniereIp = fs.existsSync(DERNIERE_IP_PATH) ? fs.readFileSync(DERNIERE_IP_PATH, 'utf-8').trim() : null
  const certExiste = fs.existsSync(path.join(CERT_DIR, 'dev.pem'))
  if (derniereIp === ip && certExiste) return

  fs.mkdirSync(CERT_DIR, { recursive: true })
  try {
    execFileSync(MKCERT_PATH, [
      '-cert-file', path.join(CERT_DIR, 'dev.pem'),
      '-key-file', path.join(CERT_DIR, 'dev-key.pem'),
      'localhost', '127.0.0.1', ip, '::1'
    ], { stdio: 'pipe' })
    fs.writeFileSync(DERNIERE_IP_PATH, ip)
    console.log(`✔ Certificat HTTPS local régénéré pour ${ip}`)
  } catch (err) {
    console.warn('⚠️  Échec de la régénération du certificat HTTPS, retour au HTTP :', err.message)
  }
}

function main() {
  const ip = trouverIpLan()

  if (!ip) {
    console.warn('⚠️  Impossible de détecter une IP LAN, .env inchangé (accès mobile risque de ne pas fonctionner)')
    return
  }

  regenererCertificatSiNecessaire(ip)
  const schema = fs.existsSync(path.join(CERT_DIR, 'dev.pem')) ? 'https' : 'http'

  const contenu = `VITE_API_URL=${schema}://${ip}:${PORT_BACKEND}/api\nVITE_SOCKET_URL=${schema}://${ip}:${PORT_BACKEND}\n`

  const ancienContenu = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : ''
  if (ancienContenu === contenu) {
    console.log(`✔ .env déjà à jour (${ip})`)
    return
  }

  fs.writeFileSync(ENV_PATH, contenu)
  console.log(`✔ .env mis à jour avec l'IP LAN détectée : ${ip}`)
  console.log(`  → Accès mobile : ${schema}://${ip}:5173`)
}

main()
