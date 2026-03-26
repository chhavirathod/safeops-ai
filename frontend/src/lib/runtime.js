export function isElectronApp() {
  if (typeof window === 'undefined') return false

  return Boolean(window.electronApp?.isElectron) || window.location.protocol === 'file:'
}

export function getWarehousePageUrl() {
  if (typeof window === 'undefined') return '/alert/index.html'
  return new URL('./alert/index.html', window.location.href).href
}

export function scrollToSection(sectionId) {
  if (typeof document === 'undefined') return

  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
