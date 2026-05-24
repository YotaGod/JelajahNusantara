'use server'

/**
 * Utilitas untuk mengekstrak Latitude dan Longitude dari URL Google Maps.
 * Mendukung URL panjang maupun URL pendek (maps.app.goo.gl).
 * 
 * @param url URL Google Maps yang diinput oleh user.
 * @returns Object { lat, lng } atau null jika gagal.
 */
export async function extractCoordinatesFromMapUrl(url: string): Promise<{ lat: number; lng: number } | null> {
  try {
    if (!url || !url.startsWith('http')) return null;

    let finalUrl = url;

    // Jika URL pendek (goo.gl), kita perlu fetch untuk mendapatkan URL panjang (mengikuti redirect).
    if (url.includes('goo.gl')) {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow', // Fetch otomatis mengikuti redirect
        // Beberapa URL Google Maps membutuhkan header User-Agent sederhana agar tidak di-block
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      // response.url adalah URL tujuan akhir setelah semua redirect
      finalUrl = response.url;
    }

    // Regex untuk mencari pola /@-6.1234,106.1234,
    // Google Maps selalu menggunakan format @lat,lng di URL-nya
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = finalUrl.match(regex);

    if (match && match.length >= 3) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      // Validasi sederhana rentang latitude (-90 hingga 90) dan longitude (-180 hingga 180)
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return null;
  }
}
