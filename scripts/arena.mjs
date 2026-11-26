import { writeFile, mkdir, readFile, rm } from "node:fs/promises"

const username = "vivian-truong"

// channels i don't want on the garden
const skip = ["vivian-s-22nd-wishlist", "tracking-my-life-blp8bho30zo"]

// makes titles safe to use as file names (lowercase, no weird characters)
function clean(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60)
    .trim()
}

// grabs data from are.na. it only lets you ask ~30 times a minute,
// so if it tells me to slow down i just wait and try again
async function getData(url) {
  for (let tries = 0; tries < 5; tries++) {
    const res = await fetch(url)
    if (res.ok) return (await res.json()).data
    const seconds = Number(res.headers.get("retry-after")) || 10
    console.log(`are.na says slow down, waiting ${seconds} seconds...`)
    await new Promise((wait) => setTimeout(wait, seconds * 1000))
  }
  throw new Error(`Are.na didn't answer: ${url}`)
}

// clear out the pages from last time so anything i've deleted on are.na goes away too.
// it keeps a list of what it made in arena-files.json, so my own notes never get touched
const listFile = "scripts/arena-files.json"
const oldFiles = JSON.parse(await readFile(listFile, "utf8").catch(() => "[]"))
for (const file of oldFiles) await rm(file, { force: true })
const newFiles = []

const channels = await getData(`https://api.are.na/v3/users/${username}/contents?type=Channel&per=100`)

for (const channel of channels) {
  if (channel.visibility === "private" || skip.includes(channel.slug)) continue

  // every channel gets its own folder, next to beliefs, aesthetics etc
  const folder = `content/${clean(channel.title) || channel.slug}`
  await mkdir(folder, { recursive: true })

  // index.md is what gives the folder its proper name in the sidebar
  await writeFile(
    `${folder}/index.md`,
    `---\ntitle: "${channel.title.replace(/"/g, "'")}"\n---\n\nFrom my [are.na channel](https://www.are.na/${username}/${channel.slug}).\n`,
  )
  newFiles.push(`${folder}/index.md`)

  const blocks = await getData(`https://api.are.na/v3/channels/${channel.slug}/contents?per=100`)
  const used = new Set(["index"])

  for (const block of blocks) {
    // skip other people's channels saved inside mine
    if (block.type === "Channel") continue

    // figure out what to call the page.
    // untitled images are named after the file (IMG_1234.png) which is ugly, so ignore those.
    // text blocks just use their first few words
    let title = block.title || ""
    if (/\.(png|jpe?g|gif|webp)$/i.test(title)) title = ""
    if (!title && block.content?.plain) title = block.content.plain.split(" ").slice(0, 6).join(" ")
    if (!title) title = `untitled ${block.id}`

    // two blocks with the same name? add the block's id so neither gets overwritten
    let name = clean(title) || `block ${block.id}`
    if (used.has(name)) name = `${name} ${block.id}`
    used.add(name)

    // the page itself: text, image, description, then links
    const lines = ["---", `title: "${title.replace(/"/g, "'")}"`, "---", ""]
    const image = block.image?.small?.src_2x || block.image?.small?.src
    if (block.content?.markdown) lines.push(block.content.markdown, "")
    if (image) lines.push(`![](${image})`, "")
    if (block.description?.markdown) lines.push(block.description.markdown, "")
    if (block.source?.url) lines.push(`[visit link](${block.source.url})`, "")
    lines.push(`[see it on are.na](https://www.are.na/block/${block.id})`)

    await writeFile(`${folder}/${name}.md`, lines.join("\n") + "\n")
    newFiles.push(`${folder}/${name}.md`)
  }
}

await writeFile(listFile, JSON.stringify(newFiles, null, 2))
console.log(`done: ${newFiles.length} pages`)