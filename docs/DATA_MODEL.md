# Modèle de données — Wicthu

## Schéma de base de données (Supabase)

![Schéma UML — partie 1 : Competence, arme, occupation, OccupationSkill, OccupationSkillOption](./UML_p1.png)

![Schéma UML — partie 2 : ouvrage_occulte, Investigateur, phobie, manie, artefact, equipements](./UML_p2.png)

![Schéma UML — partie 3 : sort, ouvrage_mythe, ouvrage_sort](./UML_p3.png)

![Schéma UML — partie 4 : Entite, EntiteStatBlock, EntitePouvoir, EntiteAttaque, EntiteCompetence](./UML_p4.png)

---

## Énumérations

### `EntiteCategorie`

| Valeur | Signification |
|--------|---------------|
| `CREATURE_MYTHE` | Créatures du Mythe de Cthulhu |
| `DIVINITE_MYTHE` | Grands Anciens, Dieux Extérieurs |
| `HORREUR_TRADITIONNEL` | Vampires, loups-garous, etc. |
| `FAUNE` | Animaux réels ou semi-réels |

### `OccupationSkillType`

| Valeur | Signification |
|--------|---------------|
| `FIXED` | Compétence fixe imposée |
| `FIXED_SPEC` | Compétence fixe avec spécialité imposée |
| `FREE_SPEC` | Compétence fixe, spécialité libre |
| `CHOICE_FROM_LIST` | Choix parmi une liste de compétences |
| `FREE_CHOICE` | Compétence entièrement libre |

---

## Notes de conception

- **`Investigateur.data`** est un champ `json` libre : il stocke l'intégralité du formulaire de fiche (clés = noms de champs PDF). Ce choix évite de rigidifier le schéma pour un formulaire complexe de ~80 champs.
- **`EntiteStatBlock`** supporte les entités multi-formes via plusieurs enregistrements liés à la même `Entite` (ex : Shoggoth Seigneur possède une forme humaine et une forme monstrueuse).
- **`sort`** est auto-référencée (`parentId`) pour modéliser les variantes de sorts (parent → enfants). Le champ `autre_name` est un tableau PostgreSQL natif (`_varchar`).
- **`ouvrage_sort`** est une table de jointure enrichie entre `ouvrage_mythe` et `sort`, permettant d'indiquer le nom du sort tel qu'il apparaît dans l'ouvrage et d'y joindre des notes.
- **`Competence`** est auto-référencée (`category_id`) pour distinguer les catégories (nœuds) des compétences feuilles (`is_category = false`).
- Les colonnes `sort_order` sur les tables filles (`EntiteStatBlock`, `EntiteAttaque`, etc.) garantissent un affichage ordonné indépendamment de l'ordre d'insertion en base.
