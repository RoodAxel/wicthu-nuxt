/**
 * Banques de prénoms (américains, années 1920) et de noms de famille utilisées
 * par le générateur de nom aléatoire de la fiche d'investigateur.
 * Les prénoms sont scindés par genre : le tirage utilise la liste correspondant
 * au genre choisi, ou les deux réunies si le genre est « Autre » / non renseigné.
 */

export type NameGender = 'homme' | 'femme' | 'autre'

const MALE_FIRST_NAMES = [
  'Aaron', 'Abraham', 'Addison', 'Ambrose', 'Amos', 'Anderson',
  'Archibald', 'Arthur', 'August', 'Barnabas', 'Barney', 'Baxter',
  'Blair', 'Caleb', 'Cecil', 'Charles', 'Chester', 'Clarence',
  'Clifford', 'Clinton', 'Cornelius', 'Curtis', 'Dayton', 'Delbert',
  'Douglas', 'Dudley', 'Edgar', 'Eldridge', 'Elias', 'Elijah',
  'Emanuel', 'Emmet', 'Enoch', 'Ephraim', 'Ernest', 'Ethan',
  'Everett', 'Ezekiel', 'Ezra', 'Forest', 'Franklin', 'George',
  'Gilbert', 'Granville', 'Gustaf', 'Hampton', 'Harmon', 'Harold',
  'Henderson', 'Henry', 'Herman', 'Hilliard', 'Howard', 'Hudson',
  'Irvin', 'Isaac', 'Jackson', 'Jacob', 'James', 'Jeremiah',
  'Jonah', 'Josiah', 'Kirk', 'Larkin', 'Leland', 'Leopold',
  'Lloyd', 'Luther', 'Manford', 'Marcellus', 'Martin', 'Mason',
  'Maurice', 'Maynard', 'Melvin', 'Miles', 'Milton', 'Mordecai',
  'Morgan', 'Mortimer', 'Moses', 'Napoleon', 'Nathaniel', 'Nelson',
  'Newton', 'Noble', 'Obadiah', 'Oliver', 'Orson', 'Oswald',
  'Pablo', 'Percival', 'Phineas', 'Porter', 'Quincy', 'Randall',
  'Randolph', 'Raymond', 'Reginald', 'Richmond', 'Robert', 'Rodney',
  'Roscoe', 'Rowland', 'Rupert', 'Sampson', 'Sanford', 'Sebastian',
  'Shelby', 'Sidney', 'Silas', 'Sylvester', 'Thaddeus', 'Thomas',
  'Uriah', 'Walter', 'Wilbur', 'Wilfred', 'William', 'Zadok',
  'Zebedee', 'Zebediah'
]

const FEMALE_FIRST_NAMES = [
  'Abigail', 'Adele', 'Agatha', 'Agnes', 'Albertina', 'Almeda',
  'Amelia', 'Anastasia', 'Annabelle', 'Asenath', 'Augusta', 'Barbara',
  'Beatrice', 'Bernadette', 'Bernice', 'Beryl', 'Beulah', 'Camilla',
  'Carmen', 'Caroline', 'Cecilia', 'Celeste', 'Charity', 'Christina',
  'Clarissa', 'Claudia', 'Constance', 'Cordelia', 'Cynthia', 'Daisy',
  'Dolores', 'Dorcas', 'Doris', 'Dorothy', 'Edith', 'Edna',
  'Eleanor', 'Eloise', 'Elsie', 'Estelle', 'Ethel', 'Eudora',
  'Eugenie', 'Eunice', 'Evelyn', 'Florence', 'Frances', 'Frieda',
  'Genevieve', 'Gertrude', 'Gladys', 'Gretchen', 'Hannah', 'Helen',
  'Henrietta', 'Hepzibah', 'Hoshea', 'Ingrid', 'Irene', 'Iris',
  'Ivy', 'Jeanette', 'Jezebel', 'Josephine', 'Joyce', 'Juanita',
  'Keziah', 'Laverne', 'Lavinia', 'Leonora', 'Letitia', 'Lillian',
  'Loretta', 'Lucinda', 'Lucretia', 'Mabel', 'Madeleine', 'Margaret',
  'Margery', 'Marguerite', 'Marjorie', 'Matilda', 'Mehitable', 'Melinda',
  'Melissa', 'Mercedes', 'Mercy', 'Mildred', 'Millicent', 'Muriel',
  'Myrtle', 'Naomi', 'Nora', 'Octavia', 'Ophelia', 'Pansy',
  'Patience', 'Pearle', 'Phoebe', 'Phyllis', 'Prudence', 'Rose',
  'Rosemary', 'Ruby', 'Ruth', 'Sadie', 'Selina', 'Selma',
  'Sibyl', 'Sylvia', 'Tabitha', 'Ursula', 'Veronica', 'Violet',
  'Virginia', 'Wanda', 'Wilhelmina', 'Winifred'
]

const LAST_NAMES = [
  'Abraham', 'Adler', 'Alhazred', 'Angell', 'Ankins', 'Arkham',
  'Armitage', 'Avery', 'Barnham', 'Bates', 'Bentz', 'Bessler',
  'Blake', 'Blakely', 'Bleeker', 'Bretz', 'Brock', 'Buchman',
  'Butts', 'Caffey', 'Carter', 'Castaigne', 'Click', 'Cordova',
  'Corey', 'Crabtree', 'Crane', 'Crankovitch', 'Crawford', 'Curwen',
  'Cuthburt', 'Cuttling', 'Danforth', 'Delapore', 'Derby', 'Doris',
  'Dorman', 'Dunwich', 'Dutton', 'Dyer', 'Eakley', 'Eddie',
  'Elliot', 'Elsner', 'Elwood', 'Fandrick', 'Farwell', 'Feigel',
  'Felten', 'Fenske', 'Fillman', 'Finley', 'Firske', 'Fitzgerald',
  'Flanagan', 'Franklin', 'Freeman', 'Frisbe', 'Gardner', 'Gedney',
  'Gilman', 'Gore', 'Greenwald', 'Hahn', 'Hammermeister', 'Harding',
  'Harley', 'Heminger', 'Hogue', 'Hollister', 'Holt', 'Hutchinson',
  'Innsmouth', 'Kasper', 'Kingsport', 'Kisro', 'Kleeman', 'Lake',
  'Laney', 'Levard', 'Lockhart', 'Luckstrim', 'Lynch', 'Madison',
  'Malone', 'Mantei', 'Marsh', 'McBurney', 'McCarney', 'Miskatonic',
  'Morgan', 'Moses', 'Mowry', 'Munroe', 'Nickels', 'Norrys',
  'Noyes', 'O\'Neil', 'Olmstead', 'Olson', 'Orne', 'Osborn',
  'Ozanich', 'Pabody', 'Palfrey', 'Patterson', 'Patzer', 'Peaslee',
  'Peppin', 'Phillips', 'Pickman', 'Porter', 'Posch', 'Randolph',
  'Raslo', 'Razner', 'Rifenberg', 'Riley', 'Ripley', 'Rossini',
  'Sawyer', 'Schiltgan', 'Schmidt', 'Schroeder', 'Schwartz', 'Shane',
  'Shattuck', 'Shea', 'Slaughter', 'Smith', 'Speltzer', 'Stimac',
  'Strenburg', 'Strong', 'Swanson', 'Thurston', 'Tillinghast', 'Traver',
  'Upton', 'Urton', 'Vallier', 'Wagner', 'Waite', 'Walsted',
  'Wang', 'Ward', 'Warner', 'Webber', 'Weeden', 'Welch',
  'Whateley', 'Willett', 'Winters', 'Yarbroush', 'Yeske'
]

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!

/** Liste de prénoms correspondant au genre (les deux réunies si indéterminé). */
function firstNamesFor(gender?: NameGender | null): readonly string[] {
  if (gender === 'homme') return MALE_FIRST_NAMES
  if (gender === 'femme') return FEMALE_FIRST_NAMES
  return [...MALE_FIRST_NAMES, ...FEMALE_FIRST_NAMES]
}

export function useRandomName() {
  function generateName(gender?: NameGender | null): string {
    return `${pick(firstNamesFor(gender))} ${pick(LAST_NAMES)}`
  }
  return { generateName, MALE_FIRST_NAMES, FEMALE_FIRST_NAMES, LAST_NAMES }
}
