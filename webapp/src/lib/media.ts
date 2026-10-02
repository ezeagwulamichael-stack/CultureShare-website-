/** Downscale an uploaded image to a data URL so drafts survive a reload (localStorage-safe). */
export function imageToDataUrl(file: File, max = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * s)
      c.height = Math.round(img.height * s)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = url
  })
}

/** Grab a poster frame from an uploaded video. */
export function videoPoster(file: File, max = 1000): Promise<{ poster: string; duration: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.muted = true
    v.preload = 'metadata'
    v.src = url
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(0.5, v.duration / 2)
    }
    v.onseeked = () => {
      const s = Math.min(1, max / Math.max(v.videoWidth, v.videoHeight))
      const c = document.createElement('canvas')
      c.width = Math.round(v.videoWidth * s) || 640
      c.height = Math.round(v.videoHeight * s) || 360
      c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
      const d = Math.round(v.duration || 0)
      URL.revokeObjectURL(url)
      resolve({ poster: c.toDataURL('image/jpeg', 0.75), duration: `${Math.floor(d / 60)}:${String(d % 60).padStart(2, '0')}` })
    }
    v.onerror = reject
  })
}
