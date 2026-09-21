"""Construit le fichier de donnees final des occupations.

Entree  : occ5.json (parse3) + competences.json (table Competence)
Sortie  : occupations.json, structure pour l'import Prisma.

Decisions appliquees :
  1. "(au choix)" dans les parentheses -> FREE_SPEC (et non FIXED_SPEC)
  2. specialites multiples -> FREE_SPEC avec choiceCount > 1
  3. notes de bas de bloc -> champ `note`
"""
import io, json, re, sys, unicodedata

occ = json.load(io.open(sys.argv[1], encoding="utf-8"))
comps = json.load(io.open(sys.argv[2], encoding="utf-8"))
if len(sys.argv) > 4:
    comps += [dict(c, id=None) for c in json.load(io.open(sys.argv[4], encoding="utf-8"))]


def norm(s):
    s = unicodedata.normalize("NFD", (s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9']+", " ", s.replace("’", "'")).strip()


BY = {}
for c in comps:
    BY.setdefault(norm(c["name"]), c)
IS_CAT = {norm(c["name"]) for c in comps if c["isCategory"]}
SOCIAL = [{"name": n, "specName": None} for n in ("Baratin", "Charme", "Intimidation", "Persuasion")]
NUM = {"une": 1, "un": 1, "deux": 2, "trois": 3, "quatre": 4, "cinq": 5}

FREE_RE = re.compile(r"(?:plus\s+)?(une|un|deux|trois|quatre|cinq)\s+comp[ée]tences?\s*\*?\s*au choix", re.I)
SOC_RE = re.compile(r"(une|un|deux|trois)\s+comp[ée]tences?\s+sociales?", re.I)
SPEC_N_RE = re.compile(r"(une|un|deux|trois)\s+(?:sp[ée]cialit[ée]s?|champs?)\s+(.*)", re.I)
CAT_OF = {"scientifiques": "Sciences", "scientifique": "Sciences"}


def split_ou(s):
    """Decoupe sur ' ou ' hors parentheses."""
    out, depth, buf, i = [], 0, "", 0
    while i < len(s):
        depth += (s[i] == "(") - (s[i] == ")")
        if depth == 0 and s[i:i + 4] == " ou ":
            out.append(buf); buf = ""; i += 4
            continue
        buf += s[i]; i += 1
    out.append(buf)
    return [x.strip() for x in out if x.strip()]


def split_top(s):
    out, depth, buf = [], 0, ""
    for ch in s:
        depth += (ch == "(") - (ch == ")")
        if ch == "," and depth == 0:
            out.append(buf); buf = ""
        else:
            buf += ch
    out.append(buf)
    return [x.strip() for x in out if x.strip()]


def parse_skills(raw, review):
    """Renvoie la liste de SkillDef pour un bloc `Competences :`."""
    skills = []
    raw = re.sub(r"\s+\d{1,3}\s+(INVESTIGATEUR|OCCUPATIONS)\b.*$", "", raw)
    # queue "Voir aussi X, Y" -> renvoi, pas une competence
    voir = None
    m = re.search(r"\bVoir aussi\s+(.+)$", raw)
    if m:
        voir = [v.strip(" .") for v in re.split(r",| et ", m.group(1)) if v.strip(" .")]
        raw = raw[:m.start()].strip(" ,.")
    # note de bas de bloc collee a la fin
    note = None
    m = re.search(r"\bNote\s*:\s*(.+)$", raw)
    if m:
        note = m.group(1).strip()
        raw = raw[:m.start()].strip(" ,.")

    m = re.search(r"(?:plus\s+)?(une|un|deux|trois|quatre)\s+comp[ée]tences?\s+parmi\s*:\s*(.+)$", raw, re.I)
    parmi = None
    if m:
        n = NUM.get(m.group(1).lower(), 1)
        opts = []
        for piece in split_top(m.group(2)):
            for p in split_ou(piece):
                mm = re.match(r"^([^(]+?)\s*\(([^)]*)\)$", p)
                head = (mm.group(1) if mm else p).strip(" .")
                spec = mm.group(2).strip() if mm else None
                if spec and spec.lower() in ("au choix",):
                    spec = None
                if norm(head) in BY:
                    opts.append({"name": BY[norm(head)]["name"], "specName": spec})
                else:
                    review.append(f"option « {p} » non resolue dans un choix « parmi »")
        parmi = {"type": "CHOICE_FROM_LIST", "count": n, "options": opts}
        raw = raw[:m.start()].strip(" ,.")

    for frag in split_top(raw):
        f = re.sub(r"^(plus|et)\s+", "", frag.strip(" .;"), flags=re.I)
        if not f:
            continue
        low = f.lower()

        if SOC_RE.search(f) and "au choix" not in low:
            n = NUM.get(SOC_RE.search(f).group(1).lower(), 1)
            skills.append({"type": "CHOICE_FROM_LIST", "count": n,
                           "options": SOCIAL, "note": "compétence sociale"})
            continue
        if FREE_RE.search(f):
            n = NUM.get(FREE_RE.search(f).group(1).lower(), 1)
            tail = f[FREE_RE.search(f).end():].strip(" ,")
            skills.append({"type": "FREE_CHOICE", "count": n,
                           "note": re.sub(r"^correspondant\s+[aà]\s+", "", tail) or None})
            continue
        # "trois specialites scientifiques", "trois champs de recherche"
        m = SPEC_N_RE.match(f)
        if m:
            n = NUM.get(m.group(1).lower(), 1)
            qual = m.group(2).strip(" .")
            cat = CAT_OF.get(qual.split()[-1].lower()) if qual else None
            if cat:
                skills.append({"type": "FREE_SPEC", "categoryName": cat, "count": n})
            else:
                skills.append({"type": "FREE_CHOICE", "count": n, "note": f})
                review.append(f"choix generique a verifier : « {f} »")
            continue

        # "Categorie (…)"
        m = re.match(r"^([^(]+?)\s*\(([^)]*)\)$", f)
        if m and norm(m.group(1)) in BY:
            cat, inner = BY[norm(m.group(1))]["name"], m.group(2).strip()
            il = inner.lower()
            mn = re.match(r"^(une|un|deux|trois)\s+au choix$", il)
            if il == "au choix":
                skills.append({"type": "FREE_SPEC", "categoryName": cat, "count": 1})
            elif mn:
                skills.append({"type": "FREE_SPEC", "categoryName": cat, "count": NUM[mn.group(1)]})
            elif re.search(r"\bet\s+(deux|trois)\s+autres?\b", il):
                k = re.search(r"\bet\s+(deux|trois)\s+autres?\b", il).group(1)
                base = re.split(r"\s+et\s+", inner)[0].strip()
                skills.append({"type": "FIXED_SPEC", "categoryName": cat, "specName": base})
                skills.append({"type": "FREE_SPEC", "categoryName": cat, "count": NUM[k]})
            elif " ou " in il or "," in inner or il.endswith("etc."):
                skills.append({"type": "FREE_SPEC", "categoryName": cat, "count": 1, "note": inner})
                review.append(f"specialite au choix : {cat} ({inner})")
            else:
                skills.append({"type": "FIXED_SPEC", "categoryName": cat, "specName": inner})
            continue

        # "X ou Y" entre deux competences nommees (avec ou sans specialite)
        if len(split_ou(f)) > 1:
            parts = split_ou(f)
            heads, specs_, ok = [], [], True
            for p in parts:
                mm = re.match(r"^([^(]+?)\s*\(([^)]*)\)$", p)
                head = (mm.group(1) if mm else p).strip()
                if norm(head) not in BY:
                    ok = False
                    break
                heads.append(BY[norm(head)]["name"])
                specs_.append(mm.group(2).strip() if mm else None)
            if ok and len(heads) >= 2:
                skills.append({"type": "CHOICE_FROM_LIST", "count": 1,
                               "options": [{"name": h, "specName": sp}
                                           for h, sp in zip(heads, specs_)]})
                continue

        n = norm(f)
        if n in BY:
            if n in IS_CAT:
                skills.append({"type": "FREE_SPEC", "categoryName": BY[n]["name"], "count": 1})
            else:
                skills.append({"type": "FIXED", "name": BY[n]["name"]})
            continue

        # queue adjectivale orpheline d'un FREE_CHOICE : "…, universitaires ou d'epoque"
        if skills and skills[-1]["type"] == "FREE_CHOICE" and not re.search(r"[A-ZÉÈ]", f[:1]):
            skills[-1]["note"] = ((skills[-1].get("note") or "") + ", " + f).strip(" ,")
            continue
        skills.append({"type": "UNPARSED", "raw": f})
        review.append(f"NON RESOLU : « {f} »")
    if parmi:
        skills.append(parmi)
    return skills, note, voir


def alt_names(name):
    """Titres composites : 'Trafiquant/Voyou' -> ['Voyou']."""
    out = []
    if "/" in name:
        out += [p.strip() for p in name.split("/")[1:] if p.strip()]
    m = re.match(r"^(.+?)\s+ou\s+(.+)$", name)
    if m:
        out.append(m.group(2).strip())
    return [o for o in dict.fromkeys(out) if o]


result = []
for r in occ:
    if not r.get("skills"):
        # parent pur : pas de stats propres, mais il porte quand meme son etiquette
        ptag = (r.get("tag") or "").lower()
        result.append({
            "name": r["name"], "parent": r.get("parent"),
            "era": "CLASSIQUE" if "classique" in ptag else ("MODERNE" if "moderne" in ptag else None),
            "is_lovecraftian": "lovecraft" in ptag,
            "autre_name": alt_names(r["name"]),
            "description": r.get("description") or None,
            "credit_min": None, "credit_max": None, "point_competence": None,
            "contacts": None, "note": r.get("note"), "voir_aussi": None,
            "skills": [], "review": ["parent sans statistiques propres (ses variantes les portent)"],
        })
        continue

    review = []
    tag = (r.get("tag") or "").lower()
    era = "CLASSIQUE" if "classique" in tag else ("MODERNE" if "moderne" in tag else None)
    lovecraft = "lovecraft" in tag

    cmin = cmax = None
    cred = r.get("credit") or ""
    m = re.search(r"(\d+)\s*[-–]\s*(\d+)", cred)
    if m:
        cmin, cmax = int(m.group(1)), int(m.group(2))
    elif cred:
        review.append(f"credit illisible : « {cred[:60]} »")

    pts = (r.get("points") or "").strip()
    if pts and not re.match(r"^[ÉE]DU", pts):
        review.append(f"formule de points suspecte : « {pts[:60]} »")

    skills, note_tail, voir = parse_skills(r["skills"], review)
    if len(skills) > 8:
        review.append(f"{len(skills)} lignes de competences (le livre en annonce 8 max)")

    result.append({
        "name": r["name"],
        "parent": r.get("parent"),
        "era": era,
        "is_lovecraftian": lovecraft,
        "autre_name": alt_names(r["name"]),
        "description": r.get("description") or None,
        "credit_min": cmin, "credit_max": cmax,
        "point_competence": pts or None,
        "contacts": r.get("contacts") or None,
        "note": r.get("note") or note_tail,
        "voir_aussi": voir,
        "skills": skills,
        "review": review,
    })

# --- Fusion des variantes homonymes de leur parent -------------------------
# Le Manuel presente parfois une variante "generique" portant le meme nom que
# la section qui l'englobe (Photographe, Pilote) : le parent ne porte que la
# description, l'homonyme porte les statistiques. On replie les statistiques
# sur le parent et on supprime la ligne en double, pour ne pas avoir deux
# occupations de meme nom (slug unique, resolution par nom du formulaire).
parents = {r["name"]: r for r in result if r["parent"] is None}
fusionnes = []
for r in result:
    p = parents.get(r["name"])
    if not (r["parent"] and r["parent"] == r["name"] and p is not None and p is not r):
        continue
    for k in ("credit_min", "credit_max", "point_competence", "contacts",
              "note", "voir_aussi", "era"):
        if not p.get(k):
            p[k] = r.get(k)
    if not p["skills"]:
        p["skills"] = r["skills"]
    p["is_lovecraftian"] = p["is_lovecraftian"] or r["is_lovecraftian"]
    p["autre_name"] = list(dict.fromkeys(p["autre_name"] + r["autre_name"]))
    p["review"] = [m for m in p["review"] if "parent sans statistiques" not in m]
    p["review"] += r["review"] + ["variante homonyme fusionnee dans le parent"]
    fusionnes.append(r)

result = [r for r in result if r not in fusionnes]

# --- Les parents sans statistiques heritent de leur variante la plus generique ---
# Sans cela, choisir « Criminel » ou « Journaliste » dans le formulaire ne donne
# ni formule de points ni mise en evidence des competences. On recopie donc les
# statistiques de la variante de base du metier ; le parent garde sa propre
# description, et la variante reste une occupation a part entiere.
#
# Table explicite plutot qu'une heuristique : le choix de « la plus generique »
# est un arbitrage de contenu, il doit rester relisible et corrigeable ici.
VARIANTE_GENERIQUE = {
    "Comédien": "Acteur de théâtre",                # l'acteur ordinaire (cinema = la vedette)
    "Conducteur": "Chauffeur",                      # le conducteur generique
    "Criminel": "Criminel indépendant",
    "Employé": "Employé/Cadre",                     # l'employe de base (vs Manager/Directeur)
    "Gangster": "Mafieux",                          # l'homme de main (vs Chef mafieux)
    "Informaticien": "Informaticien ou technicien informatique",
    "Inspecteur/Officier de police": "Officier de police",   # le grade de base
    "Journaliste": "Reporter",                      # le journaliste de base
    "Marin": "Marine marchande",                    # le marin civil
    "Ouvrier": "Ouvrier non qualifié",
}

par_nom = {r["name"]: r for r in result}
for nom_parent, nom_variante in VARIANTE_GENERIQUE.items():
    p, v = par_nom.get(nom_parent), par_nom.get(nom_variante)
    if p is None or v is None:
        print(f"  !! heritage impossible : {nom_parent} <- {nom_variante} (introuvable)")
        continue
    if p["skills"]:
        continue                                    # le parent a deja ses propres stats
    for k in ("credit_min", "credit_max", "point_competence", "contacts", "note"):
        if not p.get(k):
            p[k] = v.get(k)
    p["skills"] = [dict(s) for s in v["skills"]]
    p["review"] = [m for m in p["review"] if "parent sans statistiques" not in m]
    p["review"].append(f"statistiques heritees de la variante « {nom_variante} »")
    if p["credit_min"] is None:
        p["review"].append("aucun credit recommande (absent du livre pour cette variante)")

noms = {r["name"] for r in result}
for r in result:
    if r["parent"] and r["parent"] not in noms:
        r["review"].append(f"parent « {r['parent']} » introuvable")

io.open(sys.argv[3], "w", encoding="utf-8", newline="\n").write(
    json.dumps(result, ensure_ascii=False, indent=1))

n_un = sum(1 for r in result for s in r["skills"] if s["type"] == "UNPARSED")
print(f"{len(result)} occupations -> {sys.argv[3]}")
print(f"  avec stats      : {sum(1 for r in result if r['skills'])}")
print(f"  parents purs    : {sum(1 for r in result if not r['skills'])}")
print(f"  lignes UNPARSED : {n_un}")
print(f"  a relire        : {sum(1 for r in result if r['review'] and r['skills'])}")
print(f"  fusionnees      : {len(fusionnes)} {[r['name'] for r in fusionnes]}")
