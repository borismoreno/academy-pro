export const compressImage = (
  file: File,
  options: {
    maxSizeMB?: number
    maxWidthOrHeight?: number
    quality?: number
  } = {}
): Promise<File> => {
  const {
    maxSizeMB = 1.5,
    maxWidthOrHeight = 1280,
    quality = 0.85
  } = options

  return new Promise((resolve, reject) => {
    const maxBytes = maxSizeMB * 1024 * 1024

    // If already under limit, return as-is
    if (file.size <= maxBytes) {
      resolve(file)
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width)
            width = maxWidthOrHeight
          } else {
            width = Math.round((width * maxWidthOrHeight) / height)
            height = maxWidthOrHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        // White background for JPEGs (avoids black background on transparent PNGs)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // Try compression with decreasing quality until under limit
        const tryCompress = (currentQuality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed'))
                return
              }

              if (blob.size <= maxBytes || currentQuality <= 0.3) {
                // Convert blob back to File preserving the original name
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.jpg'),
                  { type: 'image/jpeg', lastModified: Date.now() }
                )
                resolve(compressedFile)
              } else {
                // Reduce quality by 10% and try again
                tryCompress(currentQuality - 0.1)
              }
            },
            'image/jpeg',
            currentQuality
          )
        }

        tryCompress(quality)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
