async function getKurds() {
    const markdownUrl = 'https://raw.githubusercontent.com/mhmd-azeez/awesome-it-kurds/main/README.md'
    const markdown = await (await fetch(markdownUrl)).text();
    const sections = getSections(markdown);

    // https://stackoverflow.com/a/70326197/7003797
    const regex = /-\s*\[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?/ig

    const matches = [...markdown.matchAll(regex)];

    const kurds = matches.map((m) => {
        return {
            'name': m[1],
            'link': m[2],
            'tags': m[3] ? m[3].split(',').map(t => t.trim()) : [],
            'image': getProfilePicture(m[2]),
            'titles': [lastElementOf(sections.filter(s => s.line < getLineNumber(m))).name],
        };
    });

    return deduplicate(kurds);
}

function lastElementOf(array) {
    return array[array.length - 1];
}

function deduplicate(kurds) {
    let map = {};

    for (const kurd of kurds) {
        let existing = map[kurd.link];

        if (existing) {
            existing.titles = [...existing.titles, ...kurd.titles];
            console.log(existing);
        } else {
            map[kurd.link] = kurd;
        }
    }

    return Object.values(map);
}

function getProfilePicture(link) {
    if ((/twitter.com/ig).test(link)) {
        // https://stackoverflow.com/a/9396453/7003797
        const username = link.match(/https?:\/\/(www\.)?twitter\.com\/(#!\/)?@?([^\/]*)/)[3];
        return `https://res.cloudinary.com/mhmd-azeez/image/twitter_name/${username}.jpg`;
    }

    return null;
}

// https://stackoverflow.com/a/57594471/7003797
function getLineNumber(match) {
    if (!match) {
        return -1
    }

    let line = 1
    for (let i = 0; i < match.index; i++) {
        if (match.input[i] == '\n') {
            line++;
        }
    }

    return line
}

function getSections(markdown) {
    let matches = [...markdown.matchAll(/##\s+(.*)/ig)];

    return matches.map(m => {
        return {
            'name': m[1],
            'line': getLineNumber(m)
        };
    });
}