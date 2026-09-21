"""Parseur final des occupations du Manuel de l'Investigateur.

Corrections par rapport a parse2 :
  - plus de page.crop() : il rognait les caracteres a cheval sur la gouttiere
    (lettrines perdues, mots coupes en deux). On assigne chaque mot a une
    colonne par son x0.
  - filtrage des polices de chrome (Aquifer = en-tetes/folios, corps < 8pt =
    pied de page et filigrane) AVANT de calculer la gouttiere.
"""
import io, json, re, sys, logging
from collections import defaultdict
import pdfplumber

logging.getLogger("pdfminer").setLevel(logging.ERROR)

MAIN_FONT, SUB_FONT = "FHACondensedFrench", "Marketdeco"
CHROME_FONT = "Aquifer"          # en-tetes de page + numeros de folio
ITALIC = "SegoeUI-Italic"        # notes de bas de bloc

FIELDS = [
    ("points", r"^Points de comp[ée]tences d[’']occupation\s*:\s*"),
    ("credit", r"^Cr[ée]dit recommand[ée]\s*:\s*"),
    ("contacts", r"^Id[ée]es de contacts\s*:\s*"),
    ("skills", r"^Comp[ée]tences\s*:\s*"),
]


def body_words(page):
    """Mots du corps : sans en-tete/folio, sans filigrane, horizontaux.

    ATTENTION : la police Aquifer sert A LA FOIS aux en-tetes de page et aux
    etiquettes [Classique] / [Lovecraftienne] accolees aux titres. On ne peut
    donc pas filtrer par police : on filtre par bande de marge.
    """
    h = page.height
    out = []
    for w in page.extract_words(extra_attrs=["fontname", "size", "upright"],
                                x_tolerance=1.5, y_tolerance=2):
        fn = w["fontname"].split("+")[-1]
        if w["size"] < 8 or not w["upright"]:
            continue
        if fn.startswith(CHROME_FONT) and (w["top"] < h * 0.075 or w["bottom"] > h * 0.93):
            continue
        out.append(dict(w, font=fn))
    return out


def gutter(words, w):
    """Milieu du plus grand vide horizontal entre 35 % et 65 % de la largeur."""
    lo, hi = w * 0.35, w * 0.65
    xs = sorted(x for x in (d["x0"] for d in words) if lo <= x <= hi)
    bounds = [lo] + xs + [hi]
    best, split = 0, w / 2
    for a, b in zip(bounds, bounds[1:]):
        if b - a > best:
            best, split = b - a, (a + b) / 2
    return split


def cluster_lines(words, tol=3.0):
    """Regroupe les mots par ligne de base (bottom), tolerance en points."""
    out, cur, ref = [], [], None
    for d in sorted(words, key=lambda d: (d["bottom"], d["x0"])):
        if ref is None or abs(d["bottom"] - ref) <= tol:
            cur.append(d)
            ref = d["bottom"] if ref is None else ref
        else:
            out.append(sorted(cur, key=lambda d: d["x0"]))
            cur, ref = [d], d["bottom"]
    if cur:
        out.append(sorted(cur, key=lambda d: d["x0"]))
    return out


def line_stream(paths):
    out = []
    for src in paths:
        with pdfplumber.open(src) as pdf:
            for page in pdf.pages:
                ws = body_words(page)
                if not ws:
                    continue
                split = gutter(ws, page.width)
                cols = defaultdict(list)
                for d in ws:
                    cols[0 if d["x0"] < split else 1].append(d)
                for ci in (0, 1):
                    for line in cluster_lines(cols[ci]):
                        fonts = {d["font"] for d in line}
                        if any(f.startswith(MAIN_FONT) for f in fonts):
                            kind = "MAIN"
                        elif any(f.startswith(SUB_FONT) for f in fonts):
                            kind = "SUB"
                        elif fonts and all(f.startswith(ITALIC) for f in fonts):
                            kind = "NOTE"
                        else:
                            kind = "TEXT"
                        out.append((kind, undouble([d["text"] for d in line])))
    return out


def undouble(tokens):
    """Certaines lignes sont rendues deux fois (effet d'ombre) : "Note Note : :".
    On ne collapse que si la majorite des tokens sont des doublons consecutifs,
    pour ne pas abimer un vrai redoublement de mot."""
    dup = sum(1 for a, b in zip(tokens, tokens[1:]) if a == b)
    if len(tokens) >= 4 and dup >= len(tokens) * 0.4:
        out = [t for i, t in enumerate(tokens) if i == 0 or t != tokens[i - 1]]
        return " ".join(out)
    return " ".join(tokens)


def clean(s):
    s = s.replace(" ", " ").replace("/uni00A0", " ")
    for a, b in (("fi ", "fi"), ("fl ", "fl"), ("ffi ", "ffi"), ("ff ", "ff")):
        s = s.replace(a, b)
    return re.sub(r"\s{2,}", " ", s).strip()


def dehyphen(parts):
    buf = ""
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if buf.endswith("-"):
            buf = buf[:-1] + p
        elif buf:
            buf += " " + p
        else:
            buf = p
    return buf


def split_title(t):
    tag = None
    m = re.search(r"\[([^\]]+)\]", t)
    if m:
        tag = m.group(1).strip()
        t = re.sub(r"\s*\[[^\]]+\]\s*", " ", t)
    return re.sub(r"\s{2,}", " ", t).strip(" .,-"), tag


stream = [(k, clean(t)) for k, t in line_stream(sys.argv[1:-1])]
stream = [(k, t) for k, t in stream if t]

merged = []
for kind, text in stream:
    if merged and kind in ("MAIN", "SUB") and merged[-1][0] == kind:
        merged[-1] = (kind, merged[-1][1] + " " + text)
    else:
        merged.append((kind, text))

blocks, cur = [], None
for kind, text in merged:
    if kind in ("MAIN", "SUB"):
        name, tag = split_title(text)
        if len(name) < 3:
            continue
        cur = {"level": kind, "name": name, "tag": tag, "body": [], "notes": []}
        blocks.append(cur)
    elif cur is not None:
        (cur["notes"] if kind == "NOTE" else cur["body"]).append(text)

records, parent = [], None
for b in blocks:
    body = b["body"]
    idx = []
    for key, pat in FIELDS:
        for i, ln in enumerate(body):
            if re.match(pat, ln):
                idx.append((key, i, pat))
                break
    idx.sort(key=lambda t: t[1])
    rec = {"level": b["level"], "name": b["name"], "tag": b["tag"], "parent": None}
    first = idx[0][1] if idx else len(body)
    rec["description"] = dehyphen(body[:first])
    for n, (key, i, pat) in enumerate(idx):
        end = idx[n + 1][1] if n + 1 < len(idx) else len(body)
        rec[key] = re.sub(pat, "", dehyphen(body[i:end])).strip()
    rec["note"] = dehyphen(b["notes"]) or None
    if b["level"] == "MAIN":
        parent = b["name"]
    else:
        rec["parent"] = parent
    records.append(rec)

io.open(sys.argv[-1], "w", encoding="utf-8", newline="\n").write(
    json.dumps(records, ensure_ascii=False, indent=1))
n_main = sum(1 for r in records if r["level"] == "MAIN")
print(f"MAIN={n_main} SUB={len(records) - n_main} total={len(records)} "
      f"avec_competences={sum(1 for r in records if r.get('skills'))}", file=sys.stderr)
