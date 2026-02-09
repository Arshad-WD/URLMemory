import axios from 'axios'
import * as cheerio from 'cheerio'

export interface Metadata {
    title: string | null
    favicon: string | null
    domain: string
}

export async function fetchMetadata(targetUrl: string): Promise<Metadata> {
    const url = new URL(targetUrl)
    const domain = url.hostname

    try {
        const response = await axios.get(targetUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        const $ = cheerio.load(response.data)

        const title =
            $('title').text() ||
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            null

        let favicon =
            $('link[rel="icon"]').attr('href') ||
            $('link[rel="shortcut icon"]').attr('href') ||
            $('link[rel="apple-touch-icon"]').attr('href') ||
            null

        if (favicon && !favicon.startsWith('http')) {
            favicon = new URL(favicon, targetUrl).toString()
        } else if (!favicon) {
            favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
        }

        return {
            title,
            favicon,
            domain
        }
    } catch (error) {
        console.error(`Metadata fetch failed for ${targetUrl}:`, error)
        return {
            title: null,
            favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
            domain
        }
    }
}
