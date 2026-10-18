#!/usr/bin/env python3
"""Convert the band's lyric sheets (.docx) to plain text for the song pages.

Usage: python3 -I scripts/convert-lyrics.py <docx-root> <discography.json> <out-dir>

<docx-root> holds 2016-Insane-Driver/docx/*.docx and 2020-Silicon-Fortress/docx/*.docx
(today in ../lyrics-originals/). Each sheet holds the English lyrics followed by a
Portuguese translation that starts with the translated title (TRANSLATION_TITLES).
The English part becomes <out-dir>/<album>/<song>.txt (rendered on the song page) and
the translation <song>.pt.txt (stored only). In both, the title line and the "Tema:"
line are dropped, plain section labels ("Chorus II:") become "[Chorus 2]", trailing
spaces are trimmed and runs of blank lines collapsed to one. A sheet that only says
INSTRUMENTAL produces no file.
"""
import html
import json
import re
import sys
import zipfile
from pathlib import Path

ALBUMS = {'2016-Insane-Driver': 'insane-driver', '2020-Silicon-Fortress': 'silicon-fortress'}

# The line that opens the Portuguese translation of each song (checked by hand).
TRANSLATION_TITLES = {
    'buried-thoughts': 'Pensamentos Enterrados',
    'change': 'Mudança',
    'faithless-breath': 'Respiração Infiel',
    'fallen-dreams': 'Sonhos Caídos',
    'firstly-my-breakfast': 'Primeiro Meu Café da Manhã',
    'make-decisions': 'Tome Decisões',
    'tears-of-blood': 'Lágrimas De Sangue',
    'the-edge-of-life': 'O Limite da vida',
    'tide-of-fears': 'Maré de Medos',
    'today-is-sunday': 'Hoje É Domingo',
    'age-of-lies': 'Era de Mentiras',
    'desperate-prayer': 'Oração Desesperada',
    'distant-hearts': 'Corações Distantes',
    'faceless-demons': 'Demônios sem rosto',
    'ghosts': 'Fantasmas',
    'imagined-realities': 'Realidades Imaginadas',
    'insane-driver': 'Motorista Insano',
    'invisible-chains': 'Correntes Invisíveis',
    'keep-away': 'Mantenha Distância',
    'silicon-fortress': 'Fortaleza de Silício',
}

LABEL_WORDS = ('verse|chorus|bridge|speech|interlude|prayer|whispers|intro|outro|'
               'verso|refrão|refrao|ponte|interlúdio|oração|sussuros')
PLAIN_LABEL = re.compile(rf'^({LABEL_WORDS})(?: ([0-9]+|[IVX]+))?( 2x)?:?$', re.I)
BRACKET_LABEL = re.compile(r'^\[(.+)\]:$')
ROMAN = {'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5'}


def squash(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())


def slugify(title):
    return re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')


def paragraphs(path):
    xml = zipfile.ZipFile(path).read('word/document.xml').decode('utf-8')
    out = []
    for p in re.findall(r'<w:p[ >].*?</w:p>|<w:p/>', xml, re.S):
        p = re.sub(r'<w:br[^>]*/>', '\n', p)
        p = re.sub(r'<w:tab[^>]*/>', '\t', p)
        text = ''.join(re.findall(r'<w:t(?: [^>]*)?>([^<]*)</w:t>', p.replace('\n', '<w:t>\n</w:t>').replace('\t', '<w:t>\t</w:t>')))
        out.extend(html.unescape(text).split('\n'))
    return out


def label(line):
    """'Chorus II:' -> '[Chorus 2]', '[Bridge 2]:' -> '[Bridge 2]'; any other line unchanged."""
    bare = line.strip()
    bracket = BRACKET_LABEL.match(bare)
    if bracket:
        return f'[{bracket.group(1)}]'
    plain = PLAIN_LABEL.match(bare)
    if not plain:
        return line
    word, number, times = plain.groups()
    name = word[0].upper() + word[1:].lower()
    if number:
        name += ' ' + ROMAN.get(number.upper(), number)
    return f'[{name}{times or ""}]'


def tidy(lines):
    lines = [label(l.rstrip()) for l in lines if not l.strip().lower().startswith('tema:')]
    text = re.sub(r'\n{3,}', '\n\n', '\n'.join(lines)).strip('\n')
    return text + '\n' if text else ''


def convert(lines, translation_title):
    """Returns (english, portuguese) text; the title lines are dropped."""
    lines = [l.rstrip() for l in lines]
    while lines and not lines[0].strip():
        lines.pop(0)
    lines = lines[1:]  # the title line
    if translation_title is None:
        return tidy(lines), ''
    starts = [i for i, l in enumerate(lines) if l.strip() == translation_title]
    if len(starts) != 1:
        raise SystemExit(f'translation title {translation_title!r} found {len(starts)} times')
    return tidy(lines[:starts[0]]), tidy(lines[starts[0] + 1:])


def main(root, discography, out):
    albums = {a['slug']: a for a in json.loads(Path(discography).read_text())['albums']}
    for folder, album in ALBUMS.items():
        titles = {squash(t['title']): t['title'] for t in albums[album]['tracks']}
        for docx in sorted((Path(root) / folder / 'docx').glob('*.docx')):
            if docx.name.startswith('~$'):
                continue
            name = re.sub(r'^\d+ - ', '', docx.stem)
            title = titles[squash(name)]
            slug = slugify(title)
            english, portuguese = convert(paragraphs(docx), TRANSLATION_TITLES.get(slug))
            if english.strip().upper() == 'INSTRUMENTAL':
                print(f'skip {album}/{slug} (instrumental)')
                continue
            folder_out = Path(out) / album
            folder_out.mkdir(parents=True, exist_ok=True)
            (folder_out / f'{slug}.txt').write_text(english, encoding='utf-8')
            (folder_out / f'{slug}.pt.txt').write_text(portuguese, encoding='utf-8')
            print(f'wrote {album}/{slug}.txt and .pt.txt')


if __name__ == '__main__':
    main(*sys.argv[1:4])
