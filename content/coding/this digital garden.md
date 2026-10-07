## what it is

This site is my digital garden: a small collection of notes, references, ideas, things I’m learning, and things I want to remember.

It is intentionally unfinished. Pages can be tiny, messy, half-formed, or change completely over time.

## how it works

I write everything in Obsidian.

The Obsidian vault is actually the same `content` folder that Quartz reads from, so there is no separate publishing system or copying notes between apps.

The setup is basically:

```
Obsidian
↓
Markdown files
↓
Quartz
↓
GitHub
↓
this website
```

My local folder looks roughly like:

```
vivian-garden/
├── content/
│   ├── aesthetics/
│   ├── coding/
│   ├── source-notes/
│   └── index.md
├── quartz.config.yaml
└── quartz/
```

The `content` folder is opened directly as my Obsidian vault.

So when I make a note in Obsidian, I’m really just creating a Markdown file inside Quartz.

## linking notes

One of my favourite parts is that I can link ideas together using Obsidian-style wikilinks:

```
[[cassette futurism]]
[[indie craft]]
[[this digital garden]]
```

Quartz turns those into links on the site and also creates backlinks, so I can see which other notes connect to the page I’m reading.

Over time, the garden becomes less like a folder of documents and more like a little network of ideas.

## previewing it locally

When I want to see what the site looks like before publishing, I run:

```
cd ~/vivian-garden
npx quartz build --serve
```

Then I open:

```
http://localhost:8080
```

Quartz watches the `content` folder, so changes I make in Obsidian show up in the local version of the site.

## publishing

The live site is hosted through GitHub Pages.

When I’m happy with my changes, I run:

```
npx quartz sync
```

That pushes the latest Markdown files and Quartz configuration to GitHub.

A GitHub Action then builds the site and deploys it automatically.

So the full publishing flow is:

```
write in Obsidian
↓
preview with Quartz
↓
npx quartz sync
↓
GitHub
↓
GitHub Pages
```

## why I like this setup

- I can write in Obsidian instead of a CMS
- everything stays as plain Markdown files
- notes can link to each other naturally
- I own the files and the site
- there is no pressure for every page to feel finished
- the structure can grow with me
- coding the site and writing the content happen in the same little system

I like that it feels closer to maintaining a personal archive than running a blog.

## related

- [[are.na]]
- [[CARI Institute]]
- [[indiecraft]]