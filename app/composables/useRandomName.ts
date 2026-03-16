const FIRST_NAMES = [
  'Arthur', 'Henry', 'Walter', 'Edgar', 'Franklin', 'Chester', 'Howard', 'Clarence',
  'Raymond', 'Harold', 'George', 'Robert', 'William', 'Charles', 'Thomas', 'James',
  'Dorothy', 'Helen', 'Margaret', 'Ruth', 'Mildred', 'Frances', 'Eleanor', 'Evelyn',
  'Florence', 'Ethel', 'Lillian', 'Rose', 'Virginia', 'Beatrice',
]

const LAST_NAMES = [
  'Marsh', 'Whateley', 'Derby', 'Armitage', 'Peaslee', 'Phillips', 'Olmstead',
  'Carter', 'Thurston', 'Waite', 'Gardner', 'Elliot', 'Morgan', 'Blake', 'Crawford',
  'Harley', 'Pickman', 'Tillinghast', 'Noyes', 'Curwen', 'Hutchinson', 'Laney',
  'Randolph', 'Munroe', 'Osborn', 'Palfrey', 'Dutton', 'Shea', 'Fitzgerald', 'Crane',
]

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export function useRandomName() {
  function generateName(): string {
    return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
  }
  return { generateName }
}
