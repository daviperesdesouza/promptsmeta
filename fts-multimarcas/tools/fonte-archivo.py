# Gera src/assets/fonts/archivo-site.woff2: a Archivo só com o que o site usa
# (caracteres do português, pesos 600–800 e larguras 86–125%). 90 KB → ~50 KB.
#
# Uso (só se mudar os pesos/larguras usados no CSS):
#   python3 -m venv .venv && .venv/bin/pip install fonttools brotli
#   .venv/bin/python tools/fonte-archivo.py
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ORIGEM = 'node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'
DESTINO = 'src/assets/fonts/archivo-site.woff2'
CARACTERES = (list(range(0x20, 0x7F)) + list(range(0xA0, 0x100))  # ASCII + acentos (Latin-1)
              + [0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E,  # travessões e aspas
                 0x2022, 0x2026, 0x2122, 0x20AC, 0x2190, 0x2191, 0x2192, 0x2193, 0x2197])

fonte = instancer.instantiateVariableFont(TTFont(ORIGEM), {'wght': (600, 800), 'wdth': (86, 125)})
opcoes = subset.Options()
opcoes.flavor = 'woff2'
opcoes.layout_features = ['kern', 'liga', 'calt', 'tnum', 'lnum', 'case', 'ccmp', 'locl', 'mark', 'mkmk']
opcoes.name_IDs = ['*']
opcoes.notdef_outline = True
recorte = subset.Subsetter(opcoes)
recorte.populate(unicodes=CARACTERES)
recorte.subset(fonte)
fonte.flavor = 'woff2'
fonte.save(DESTINO)
print('✔', DESTINO)
