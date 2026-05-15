import * as cheerio from 'cheerio'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface ComponentRef {
  name: string
  quantity: number
}

interface DotaItem {
  id: string
  name: string
  image: string
  description: string
  buyPrice: number | null
  sellPrice: number | null
  shop: string
  usedToMake: string[]
  components: ComponentRef[]
}

const KNOWN_SHOPS = [
  'Cache of Quel-thelan',
  'Ancient of Wonders',
  'Sena The Accessorizer',
  'Weapons Dealer',
  'Leragas the Vile',
  'Protectorate',
  'Arcane Sanctum',
  'Supportive Vestment',
  'Ancient Weaponry',
  'Enchanted Artifacts',
  'Gateway Relics',
]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function scrape() {
  console.log('Fetching page...')
  const res = await fetch('https://dota-frenzy.blogspot.com/p/dota-item-list.html')
  const html = await res.text()

  console.log('Parsing HTML...')
  const $ = cheerio.load(html)

  // Get the post body content
  const postBody = $('.post-body')
  if (!postBody.length) {
    console.error('Could not find .post-body element')
    process.exit(1)
  }

  const items: DotaItem[] = []
  const bodyHtml = postBody.html() || ''

  // Strategy: find all text nodes and structure by looking for patterns
  // The page uses <span> tags with styling, <b> for names, <img> for icons
  // Shop headers are in larger/bold text

  // Let's work with the text content more carefully
  // First, let's find shop section boundaries by looking for known shop names
  // in prominent positions (usually in <b> or styled <span> tags)

  // Alternative approach: iterate through all elements sequentially
  const allText = postBody.text()

  // Let's try a different approach - parse the raw HTML by splitting on recognizable patterns
  // Shop names appear as bold/styled headings
  // Items follow with: image, bold name, description lines, buy/sell prices

  // Find shop sections by splitting HTML on shop name occurrences
  let currentShop = ''
  const sections: { shop: string; html: string }[] = []

  // Find positions of each shop name in the HTML
  const shopPositions: { shop: string; index: number }[] = []
  for (const shop of KNOWN_SHOPS) {
    // Shop names appear in bold or styled text
    const patterns = [
      `<b>${shop}</b>`,
      `>${shop}<`,
      shop,
    ]
    for (const pattern of patterns) {
      const idx = bodyHtml.indexOf(pattern)
      if (idx !== -1) {
        shopPositions.push({ shop, index: idx })
        break
      }
    }
  }

  // Sort by position
  shopPositions.sort((a, b) => a.index - b.index)

  // Create sections
  for (let i = 0; i < shopPositions.length; i++) {
    const start = shopPositions[i].index
    const end = i + 1 < shopPositions.length ? shopPositions[i + 1].index : bodyHtml.length
    sections.push({
      shop: shopPositions[i].shop,
      html: bodyHtml.slice(start, end),
    })
  }

  console.log(`Found ${sections.length} shop sections`)

  for (const section of sections) {
    console.log(`\nProcessing shop: ${section.shop}`)

    // Within each section, find items by looking for <img> tags followed by item data
    // Split section on <img tags to find item boundaries
    const imgParts = section.html.split(/<img[^>]*src="([^"]*)"[^>]*>/i)

    // imgParts alternates: [textBefore, imgSrc, textAfter, imgSrc, textAfter, ...]
    // Skip the first part (before first image, contains shop header)

    for (let i = 1; i < imgParts.length; i += 2) {
      const imageSrc = imgParts[i]
      const textBlock = imgParts[i + 1] || ''

      // Skip tiny images or non-item images
      if (!imageSrc || imageSrc.includes('favicon') || imageSrc.includes('blogger_logo')) {
        continue
      }

      // Clean the text block - remove HTML tags
      const cleanText = textBlock
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim()

      if (!cleanText) continue

      const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length === 0) continue

      // First line is usually the item name
      let name = lines[0]

      // Skip if this looks like a shop header
      if (KNOWN_SHOPS.some(s => name.includes(s))) {
        // The name might still be in the next line
        if (lines.length > 1 && !KNOWN_SHOPS.some(s => lines[1].includes(s))) {
          name = lines[1]
          lines.shift()
        } else {
          continue
        }
      }

      // Clean up name - extract price from parentheses if present (recipe items)
      name = name.replace(/^\s*[-–—]\s*/, '').trim()

      // Extract price from name like "Assault Cuirass (5550)"
      let namePrice: number | null = null
      const namePriceMatch = name.match(/\((\d+)\)\s*$/)
      if (namePriceMatch) {
        namePrice = parseInt(namePriceMatch[1])
        name = name.replace(/\s*\(\d+\)\s*$/, '').trim()
      }

      // Normalize whitespace (source has double spaces in some names)
      name = name.replace(/\s+/g, ' ').trim()

      if (!name || name.length < 2 || name.length > 60) continue

      // Parse price line
      let buyPrice: number | null = null
      let sellPrice: number | null = null
      const priceLineIdx = lines.findIndex(l => /buy\s+\d/i.test(l))
      if (priceLineIdx !== -1) {
        const priceLine = lines[priceLineIdx]
        const buyMatch = priceLine.match(/buy\s+(\d+)/i)
        const sellMatch = priceLine.match(/sell\s+(\d+)/i)
        if (buyMatch) buyPrice = parseInt(buyMatch[1])
        if (sellMatch) sellPrice = parseInt(sellMatch[1])
      }

      // Use price from name if no Buy/Sell line found
      if (buyPrice === null && namePrice !== null) {
        buyPrice = namePrice
      }

      // Parse "Used to make" line
      const usedToMake: string[] = []
      const usedLineIdx = lines.findIndex(l => /used to make/i.test(l))
      if (usedLineIdx !== -1) {
        const usedLine = lines[usedLineIdx].replace(/used to make\s*/i, '')
        usedToMake.push(
          ...usedLine
            .split(/[,;]/)
            .map(s => s.trim())
            .filter(Boolean)
        )
      }

      // Parse "Requires" line(s) for recipe components
      const components: ComponentRef[] = []
      // Collect all requires lines (sometimes split across multiple lines)
      const requiresLineIndices: number[] = []
      let requiresText = ''
      for (let li = 0; li < lines.length; li++) {
        if (/requires?\s*:/i.test(lines[li])) {
          requiresText += lines[li].replace(/requires?\s*:\s*/i, '') + ', '
          requiresLineIndices.push(li)
          // Check if next line is a continuation (no keyword, has parenthesized price)
          while (li + 1 < lines.length && !/(requires?|used to make|buy\s+\d)/i.test(lines[li + 1]) && /\(\d+\)/.test(lines[li + 1])) {
            li++
            requiresText += lines[li] + ', '
            requiresLineIndices.push(li)
          }
        }
      }

      if (requiresText) {
        // Parse component entries like:
        // "Platemail (1400)" or "3 x Oblivion Staff (3 x 1675)" or "Ring of Regeneration x2 (700)"
        const parts = requiresText.split(/,/).map(s => s.trim()).filter(Boolean)
        for (const part of parts) {
          // Skip "Recipe (xxx)" entries - not a real item
          if (/^recipe\s*\(/i.test(part)) continue

          let quantity = 1
          let compName = part

          // Remove price in parentheses: "Platemail (1400)" -> "Platemail"
          compName = compName.replace(/\s*\([^)]*\)\s*$/, '').trim()

          // Handle "3 x Oblivion Staff" prefix quantity
          const prefixQty = compName.match(/^(\d+)\s*x\s+(.+)/i)
          if (prefixQty) {
            quantity = parseInt(prefixQty[1])
            compName = prefixQty[2].trim()
          }

          // Handle "Ring of Regeneration x2" suffix quantity
          const suffixQty = compName.match(/^(.+?)\s*x\s*(\d+)$/i)
          if (suffixQty) {
            compName = suffixQty[1].trim()
            quantity = parseInt(suffixQty[2])
          }

          // Normalize whitespace
          compName = compName.replace(/\s+/g, ' ').trim()

          if (compName && compName.length > 1) {
            components.push({ name: compName, quantity })
          }
        }
      }

      // Description is everything except name, price line, "used to make" line, and requires lines
      const skipIndices = new Set([priceLineIdx, usedLineIdx, ...requiresLineIndices])
      const descLines = lines.slice(1).filter((_, idx) => {
        const actualIdx = idx + 1
        return !skipIndices.has(actualIdx)
      })
      const description = descLines.join('\n').replace(/  +/g, ' ').trim()

      const item: DotaItem = {
        id: slugify(name),
        name,
        image: imageSrc,
        description,
        buyPrice,
        sellPrice,
        shop: section.shop,
        usedToMake,
        components,
      }

      items.push(item)
      console.log(`  - ${name} (Buy: ${buyPrice}, Sell: ${sellPrice})`)
    }
  }

  console.log(`\n\nTotal items scraped: ${items.length}`)

  // Post-process: resolve component names to item IDs via fuzzy matching
  const nameToItem = new Map<string, DotaItem>()
  for (const item of items) {
    nameToItem.set(item.name.toLowerCase(), item)
  }

  // Common name variations in the source
  const NAME_ALIASES: Record<string, string> = {
    'platemail': 'plate mail',
    'quarter staff': 'quarterstaff',
    'perseverence': 'perseverance',
    'planeswalkers cloak': "planeswalker's cloak",
    'slipper of agility': 'slippers of agility',
    'belt of giant strenght': 'belt of giant strength',
    'glove of haste': 'gloves of haste',
    'maelstorm': 'maelstrom',
    'gauntlet of strength': 'gauntlets of ogre strength',
  }

  function resolveComponentName(compName: string): string | null {
    const lower = compName.toLowerCase()
    if (nameToItem.has(lower)) return nameToItem.get(lower)!.id

    // Try alias
    if (NAME_ALIASES[lower] && nameToItem.has(NAME_ALIASES[lower])) {
      return nameToItem.get(NAME_ALIASES[lower])!.id
    }

    // Fuzzy: try substring match
    for (const [itemName, item] of nameToItem) {
      if (itemName.includes(lower) || lower.includes(itemName)) {
        return item.id
      }
    }

    return null
  }

  let unresolvedCount = 0
  for (const item of items) {
    for (const comp of item.components) {
      const resolvedId = resolveComponentName(comp.name)
      if (resolvedId) {
        (comp as any).itemId = resolvedId
      } else {
        unresolvedCount++
        console.warn(`  UNRESOLVED: "${comp.name}" in ${item.name}`)
      }
    }
  }
  if (unresolvedCount) {
    console.warn(`\n${unresolvedCount} unresolved component references`)
  }

  // Show items with components
  const withComponents = items.filter(i => i.components.length > 0)
  console.log(`\nItems with recipe components: ${withComponents.length}`)

  // Show shop distribution
  const shopCounts: Record<string, number> = {}
  for (const item of items) {
    shopCounts[item.shop] = (shopCounts[item.shop] || 0) + 1
  }
  console.log('\nItems per shop:')
  for (const [shop, count] of Object.entries(shopCounts)) {
    console.log(`  ${shop}: ${count}`)
  }

  // Write to file
  const outPath = join(__dirname, '..', 'app', 'data', 'items.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(items, null, 2))
  console.log(`\nWritten to ${outPath}`)
}

scrape().catch(console.error)
