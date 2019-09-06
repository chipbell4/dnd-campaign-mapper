# DnD Campaign Mapper
This is a little tool I wrote for hosting my campaign notes and linking them all together.
It currently only handles [markdown files](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)
but I'd like to add support for other data formats (for storing maps, NPC schedules, time-based events, tables, etc.)

## An Example Setup

There are two main steps to serving your campaign notes:
- Structuring your notes in the proper way
- Installing this library and pointing it at the proper location

### Setting up campaign notes
First, start by creating some campaign notes in the following structure:

```
data/
|
| -- npcs/
|    |
|    | -- durnan.md
|
| -- locations/
|    |
|    | -- yawning_portal.md
```

Or as a shell script:

```bash
mkdir -p data/npcs/
mkdir -p data/locations/
touch data/npcs/durnan.md
touch data/npcs/yawning_portal.md
```

Now, place the following contents in `durnan.md`:

```markdown
# Durnan

Durnan works at the Yawning Portal
```

and the following contents in `yawning_portal.md`

```markdown
# Yawning Portal

An inn, ran by Durnan
```

### Configuring the server
- First, install the plugin: `npm install chipbell4/dnd-campaign-mapper`
- Now, run the server on your data: `npx map --dataDirectory data --port 3000`
- Open [http://localhost:3000](http://localhost:3000)


## What to Expect
First, you should see a glorious springy graph of the items in the (rather lame) campaign we just made.
Moreover, you should see links for each of the files we just made.
If you click that link (say to [http://localhost:3000/npcs/durnan](http://localhost:3000/npcs/durnan)), only should you see your content,
but the Yawning Portal should be _automatically linked for you_. This is the "killer feature":
If you mention the title of another file, app will detect it and automatically link it for you.

For instance, let's say you updated your Yawning Portal text to something like:

> An inn, ran by Durnan. The most happening juke joint in all of Waterdeep.

Then:
1) The text will read a bit more hip most def.
2) If you later create a markdown file for Waterdeep (more specifically, make the _first line contain "Waterdeep"_) this link will automatically be created. Do watch for spelling errors though :D
