# Modèle de données — Wicthu

## Diagramme Entité-Relation

```mermaid
erDiagram

    %% ── COMPÉTENCES ──────────────────────────────────────────────
    Competence {
        int4    id          PK
        text    name
        int4    category_id FK
        int2    base_value
        bool    is_category
        bool    modern
        bool    rare
    }
    Competence ||--o{ Competence : "category_id → id (parent/enfants)"

    %% ── ARMES ────────────────────────────────────────────────────
    arme {
        int4    id              PK
        varchar name
        varchar category
        int4    competenceArme  FK
        varchar damage
        varchar average_dmg
        varchar range
        varchar cadence
        varchar capacity
        int4    failure
        float4  classic_price
        float4  modern_price
        varchar epoque
        varchar image_url
        int4    competence_id   FK
    }
    Competence ||--o{ arme : "competenceArme"
    Competence |o--o{ arme : "competence_id (optionnel)"

    %% ── ARTEFACTS ────────────────────────────────────────────────
    artefact {
        int4    id          PK
        varchar name
        varchar use_by
        varchar description
        varchar image_url
    }

    %% ── ÉQUIPEMENTS ──────────────────────────────────────────────
    equipement_classique {
        int4    id          PK
        varchar name
        varchar category
        float4  base_price
        float4  max_price
        varchar unit
        bool    superior
    }

    equipement_moderne {
        int4    id          PK
        varchar name
        varchar category
        float4  base_price
        float4  max_price
        varchar unit
        bool    superior
    }

    %% ── TRAUMATISMES ─────────────────────────────────────────────
    manie {
        int4    id          PK
        varchar name
        varchar description
    }

    phobie {
        int4    id          PK
        varchar name
        varchar description
    }

    %% ── OCCUPATIONS ──────────────────────────────────────────────
    occupation {
        int4    id               PK
        varchar name
        int4    credit_min
        int4    credit_max
        varchar point_competence
        bool    is_lovecraftian
        bool    is_modern
    }

    OccupationSkill {
        int4              id            PK
        int4              occupationId  FK
        OccupationSkillType type
        int4              competenceId  FK
        varchar           specName
        int4              choiceCount
        varchar           note
        int4              sortOrder
    }

    OccupationSkillOption {
        int4 id                 PK
        int4 occupationSkillId  FK
        int4 competenceId       FK
    }

    occupation ||--o{ OccupationSkill : "occupationId"
    OccupationSkill ||--o{ OccupationSkillOption : "occupationSkillId"
    Competence |o--o{ OccupationSkill : "competenceId (fixe)"
    Competence ||--o{ OccupationSkillOption : "competenceId (choix)"

    %% ── SORTS ────────────────────────────────────────────────────
    sort {
        int4     id                   PK
        varchar  name
        varchar  cout
        varchar  temps_incantation
        text     description
        text     version_approfondie
        _varchar autre_name
        int4     parentId             FK
    }
    sort |o--o{ sort : "parentId → id (parent/variantes)"

    %% ── OUVRAGES ─────────────────────────────────────────────────
    ouvrage_mythe {
        int4    id                  PK
        varchar titre
        varchar langue
        varchar date
        varchar auteur
        text    description
        varchar sante_mental
        int4    gain_mythe_initial
        int4    gain_mythe_complet
        int4    mythe_cthulhu
        int4    semaine
    }

    ouvrage_sort {
        int4    id               PK
        int4    ouvrage_id       FK
        int4    sort_id          FK
        varchar nom_dans_ouvrage
        varchar note
    }

    ouvrage_occulte {
        int4    id          PK
        varchar title
        varchar language
        varchar date
        varchar author
        varchar info
        text    description
        varchar sanity
        int4    occult_gain
    }

    ouvrage_mythe ||--o{ ouvrage_sort : "ouvrage_id"
    sort          |o--o{ ouvrage_sort : "sort_id (nullable)"

    %% ── ENTITÉS DU MYTHE ─────────────────────────────────────────
    Entite {
        int4    id                      PK
        varchar categorie
        varchar name
        varchar titre
        varchar citationTexte
        varchar citationSource
        text    description
        varchar attaques_par_round
        varchar options_combat_desc
        varchar protection
        varchar perte_sante_mentale
        varchar culte_adoration
        varchar entite_particularites
        varchar image_url
    }

    EntiteStatBlock {
        int4    id          PK
        int4    entite_id   FK
        varchar forme_name
        varchar forme_note
        int4    sort_order
        varchar for_val
        varchar con_val
        varchar tai_val
        varchar dex_val
        varchar int_val
        varchar pou_val
        varchar app_val
        varchar edu_val
        varchar pv_moyen
        varchar impact_moy
        varchar carrure_moy
        varchar pm_moyen
        varchar mouvement
    }

    EntitePouvoir {
        int4    id          PK
        int4    entite_id   FK
        varchar name
        text    description
        int4    sort_order
    }

    EntiteAttaque {
        int4    id           PK
        int4    entite_id    FK
        varchar name
        varchar valeur
        varchar degats
        bool    is_manoeuvre
        text    description
        int4    sort_order
    }

    EntiteCompetence {
        int4    id          PK
        int4    entite_id   FK
        varchar name
        varchar valeur
        int4    sort_order
    }

    Entite ||--o{ EntiteStatBlock   : "entite_id"
    Entite ||--o{ EntitePouvoir     : "entite_id"
    Entite ||--o{ EntiteAttaque     : "entite_id"
    Entite ||--o{ EntiteCompetence  : "entite_id"

    %% ── INVESTIGATEUR ────────────────────────────────────────────
    Investigateur {
        int4      id        PK
        varchar   userId
        varchar   nom
        json      data
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## Tables — détail des colonnes

### `Competence`

| Colonne | Type | Contrainte | Description |
|---------|------|------------|-------------|
| `id` | int4 | PK | Identifiant |
| `name` | text | NOT NULL | Nom de la compétence |
| `category_id` | int4 | FK → `Competence.id` | Catégorie parente (null si racine) |
| `base_value` | int2 | | Valeur de base (%) |
| `is_category` | bool | NOT NULL | `true` = nœud catégorie, pas une vraie compétence |
| `modern` | bool | | Compétence de l'époque moderne uniquement |
| `rare` | bool | | Compétence rare (cachée par défaut) |

---

### `arme`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `name` | varchar | Nom |
| `category` | varchar | Catégorie (Corps à corps, Firearms…) |
| `competenceArme` | int4 | FK → `Competence.id` (compétence principale) |
| `damage` | varchar | Dés de dégâts (ex: `1D6+db`) |
| `average_dmg` | varchar | Dégâts moyens |
| `range` | varchar | Portée |
| `cadence` | varchar | Cadence de tir |
| `capacity` | varchar | Capacité du chargeur |
| `failure` | int4 | Seuil d'enrayement |
| `classic_price` | float4 | Prix époque classique |
| `modern_price` | float4 | Prix époque moderne |
| `epoque` | varchar | Disponibilité selon époque |
| `image_url` | varchar | Illustration |
| `competence_id` | int4 | FK → `Competence.id` (optionnel, spécialité) |

---

### `occupation`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `name` | varchar | Nom de l'occupation |
| `credit_min` | int4 | Crédit minimum |
| `credit_max` | int4 | Crédit maximum |
| `point_competence` | varchar | Formule de calcul des points de compétence |
| `is_lovecraftian` | bool | Disponible en mode Lovecraftien |
| `is_modern` | bool | Disponible en époque moderne |

### `OccupationSkill`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `occupationId` | int4 | FK → `occupation.id` |
| `type` | OccupationSkillType | Nature du choix (voir enum) |
| `competenceId` | int4 | FK → `Competence.id` (pour types fixes) |
| `specName` | varchar | Nom de spécialité imposée |
| `choiceCount` | int4 | Nombre de compétences à choisir |
| `note` | varchar | Note d'affichage |
| `sortOrder` | int4 | Ordre d'affichage |

### `OccupationSkillOption`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `occupationSkillId` | int4 | FK → `OccupationSkill.id` |
| `competenceId` | int4 | FK → `Competence.id` |

---

### `sort`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `name` | varchar | Nom principal |
| `cout` | varchar | Coût en Points de Magie / Santé |
| `temps_incantation` | varchar | Durée d'incantation |
| `description` | text | Effets et règles |
| `version_approfondie` | text | Variante maîtrisée |
| `autre_name` | _varchar | Noms alternatifs (tableau PostgreSQL) |
| `parentId` | int4 | FK → `sort.id` (sort parent) |

---

### `ouvrage_mythe`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `titre` | varchar | Titre de l'ouvrage |
| `langue` | varchar | Langue d'origine |
| `date` | varchar | Période de rédaction |
| `auteur` | varchar | Auteur (réel ou fictif) |
| `description` | text | Contenu et historique |
| `sante_mental` | varchar | Perte de Santé Mentale à la lecture |
| `gain_mythe_initial` | int4 | Gain Mythe lecture initiale |
| `gain_mythe_complet` | int4 | Gain Mythe lecture complète |
| `mythe_cthulhu` | int4 | Bonus compétence Mythe de Cthulhu |
| `semaine` | int4 | Durée de lecture (semaines) |

### `ouvrage_sort`

Table de jointure enrichie entre `ouvrage_mythe` et `sort`.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `ouvrage_id` | int4 | FK → `ouvrage_mythe.id` |
| `sort_id` | int4 | FK → `sort.id` (nullable) |
| `nom_dans_ouvrage` | varchar | Nom du sort tel qu'il apparaît dans l'ouvrage |
| `note` | varchar | Note additionnelle |

### `ouvrage_occulte`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `title` | varchar | Titre |
| `language` | varchar | Langue |
| `date` | varchar | Date |
| `author` | varchar | Auteur |
| `info` | varchar | Informations pratiques |
| `description` | text | Description |
| `sanity` | varchar | Effet sur la Santé Mentale |
| `occult_gain` | int4 | Gain en compétence Occulte |

---

### `Entite`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `categorie` | varchar | Enum : `CREATURE_MYTHE`, `DIVINITE_MYTHE`, `HORREUR_TRADITIONNEL`, `FAUNE` |
| `name` | varchar | Nom de l'entité |
| `titre` | varchar | Sous-titre ou appellation |
| `citationTexte` | varchar | Citation d'ambiance |
| `citationSource` | varchar | Source de la citation |
| `description` | text | Description narrative et règles |
| `attaques_par_round` | varchar | Nombre d'attaques par round |
| `options_combat_desc` | varchar | Options de combat spéciales |
| `protection` | varchar | Armure / réduction de dégâts |
| `perte_sante_mentale` | varchar | Perte de SAN à la vue |
| `culte_adoration` | varchar | Culte et adorateurs |
| `entite_particularites` | varchar | Particularités notables |
| `image_url` | varchar | Illustration |

### `EntiteStatBlock`

Supporte les entités multi-formes (ex : Shoggoth Seigneur — forme humaine + forme monstrueuse).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `entite_id` | int4 | FK → `Entite.id` |
| `forme_name` | varchar | Nom de la forme (vide si unique) |
| `forme_note` | varchar | Note sur la forme |
| `sort_order` | int4 | Ordre d'affichage |
| `for_val` | varchar | FOR |
| `con_val` | varchar | CON |
| `tai_val` | varchar | TAI |
| `dex_val` | varchar | DEX |
| `int_val` | varchar | INT |
| `pou_val` | varchar | POU |
| `app_val` | varchar | APP |
| `edu_val` | varchar | EDU |
| `pv_moyen` | varchar | Points de Vie moyens |
| `impact_moy` | varchar | Bonus aux dommages moyen |
| `carrure_moy` | varchar | Carrure moyenne |
| `pm_moyen` | varchar | Points de Magie moyens |
| `mouvement` | varchar | Vitesse de déplacement |

### `EntiteAttaque`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `entite_id` | int4 | FK → `Entite.id` |
| `name` | varchar | Nom de l'attaque |
| `valeur` | varchar | Score (%) |
| `degats` | varchar | Dégâts |
| `is_manoeuvre` | bool | Est une manœuvre de combat |
| `description` | text | Description de l'attaque |
| `sort_order` | int4 | Ordre d'affichage |

### `EntitePouvoir`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `entite_id` | int4 | FK → `Entite.id` |
| `name` | varchar | Nom du pouvoir |
| `description` | text | Effets |
| `sort_order` | int4 | Ordre d'affichage |

### `EntiteCompetence`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `entite_id` | int4 | FK → `Entite.id` |
| `name` | varchar | Nom de la compétence |
| `valeur` | varchar | Score (%) |
| `sort_order` | int4 | Ordre d'affichage |

---

### `Investigateur`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | int4 | PK |
| `userId` | varchar | ID utilisateur Supabase |
| `nom` | varchar | Nom de l'investigateur |
| `data` | json | Intégralité du formulaire de fiche (~80 champs) |
| `createdAt` | timestamp | Date de création |
| `updatedAt` | timestamp | Dernière modification |

---

### Tables catalogue (sans relations)

| Table | Description |
|-------|-------------|
| `artefact` | Artefacts du Mythe (id, name, use_by, description, image_url) |
| `equipement_classique` | Équipements époque classique (id, name, category, base_price, max_price, unit, superior) |
| `equipement_moderne` | Équipements époque moderne (même structure) |
| `manie` | Manies (id, name, description) |
| `phobie` | Phobies (id, name, description) |
| `ouvrage_occulte` | Ouvrages occultes non-mytiques |

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
