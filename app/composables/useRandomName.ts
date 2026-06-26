const FIRST_NAMES = [
  'Arthur', 'Henry', 'Walter', 'Edgar', 'Franklin', 'Chester', 'Howard', 'Clarence',
  'Raymond', 'Harold', 'George', 'Robert', 'William', 'Charles', 'Thomas', 'James',
  'Dorothy', 'Helen', 'Margaret', 'Ruth', 'Mildred', 'Frances', 'Eleanor', 'Evelyn',
  'Florence', 'Ethel', 'Lillian', 'Rose', 'Virginia', 'Beatrice', 'Randolph', 'Asenath',
  'Lavinia', 'Wilbur', 'Ephraim', 'Zebediah', 'Enoch', 'Mercy', 'Patience', 'Prudence',
  'Abigail', 'Nathaniel', 'Ethan', 'Josiah', 'Ezra', 'Sylvester', 'Ambrose', 'Mordecai',
  'Uriah', 'Silas', 'Lucinda', 'Hepzibah', 'Keziah', 'Dorcas', 'Mehitable', 'Elias',
  'Cornelius', 'Thaddeus', 'Obadiah', 'Phineas'
]

const LAST_NAMES = [
  'Marsh', 'Whateley', 'Derby', 'Armitage', 'Peaslee', 'Phillips', 'Olmstead', 'Carter',
  'Thurston', 'Waite', 'Gardner', 'Elliot', 'Morgan', 'Blake', 'Crawford', 'Harley',
  'Pickman', 'Tillinghast', 'Noyes', 'Curwen', 'Hutchinson', 'Laney', 'Randolph', 'Munroe',
  'Osborn', 'Palfrey', 'Dutton', 'Shea', 'Fitzgerald', 'Crane', 'Innsmouth', 'Arkham',
  'Dunwich', 'Kingsport', 'Miskatonic', 'Gilman', 'Elwood', 'Sawyer', 'Malone', 'Dyer',
  'Lake', 'Danforth', 'Gedney', 'Norrys', 'Alhazred', 'Delapore', 'Castaigne', 'Upton',
  'Holt', 'Willett', 'Ward', 'Weeden', 'Orne', 'Angell', 'Doris', 'Bates',
  'Harding', 'Pabody', 'Mowry', 'Corey'
]

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!

export function useRandomName() {
  function generateName(): string {
    return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
  }
  return { generateName }
}
