export enum Type {
  ENTRY = 'E',
  EMPTY = '0',
  BLOCK = '1',
  EXIT = 'S',
}

export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  TOP = 0,
  TOP_RIGHT = 1,
  RIGHT = 2,
  BOTTOM_RIGHT = 3,
  BOTTOM = 4,
  BOTTOM_LEFT = 5,
  LEFT = 6,
  TOP_LEFT = 7,
}

const randomNumber = (max: number): number => Math.floor(Math.random() * (max + 1));

export class Maze {
  static INITIAL_POPULATION_SIZE = 100;

  constructor(
    protected readonly rows: string[][]
  ) {}
 
  get initialPos(): Position {
    return { x: 0, y: 0 };
  }

  get size(): number {
    return this.rows.length;
  }

  get maxMovements(): number {
    let maxMovements = 0;
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.rows[i][j] === Type.EMPTY) {
          maxMovements++;
        }
      }
    }
    return maxMovements;
  }

  getNextPosition({ x, y }: Position, direction: Direction): Position {
    switch (direction) {
      case Direction.TOP:
        return { x, y: y - 1 };
      case Direction.TOP_RIGHT:
        return { x: x + 1, y: y - 1 };
      case Direction.RIGHT:
        return { x: x + 1, y };
      case Direction.BOTTOM_RIGHT:
        return { x: x + 1, y: y + 1 };
      case Direction.BOTTOM:
        return { x, y: y + 1 };
      case Direction.BOTTOM_LEFT:
        return { x: x - 1, y: y + 1 };
      case Direction.LEFT:
        return { x: x - 1, y };
      case Direction.TOP_LEFT:
        return { x: x - 1, y: y - 1 };
      default:
        throw new Error('Invalid direction');
    }
  }

  protected getWeight({ x, y }: Position): number {
    if (!this.rows[y] || !this.rows[y][x]) {
      return 0;
    }
    switch (this.rows[y][x]) {
      case Type.ENTRY:
        return 0;
      case Type.BLOCK:
        return 1;
      case Type.EMPTY:
        return 2;
      case Type.EXIT:
        return 30;
      default:
        throw new Error('Invalid position type');
    }
  }

  protected makePopulation(): Direction[][] {
    const population: Direction[][] = [];
    while (population.length < Maze.INITIAL_POPULATION_SIZE) {
      const cromossome: Direction[] = [];
      while (cromossome.length < this.maxMovements) {
        cromossome.push(randomNumber(7));
      }
      population.push(cromossome);
    }
    return population;
  }

  protected getValuation(cromossome: Direction[]): number {
    let valuation = 0;
    let position = this.initialPos;
    for (let i = 0; i < cromossome.length; i++) {
      position = this.getNextPosition(position, cromossome[i]);
      valuation += this.getWeight(position);
    }
    return valuation;
  }

  protected getRandomCromossome(population: Direction[][]): Direction[] {
    return population[randomNumber(population.length - 1)];
  }

  protected tournament(population: Direction[][]): Direction[] {
    const first = this.getRandomCromossome(population);
    const second = this.getRandomCromossome(population);
    if (first === second) {
      return this.tournament(population);
    }
    if (this.getValuation(first) > this.getValuation(second)) {
      return first;
    }
    return second;
  }

  protected createChild(population: Direction[][]): Direction[] {
    const father = this.tournament(population);
    const mother = this.tournament(population);
    if (father === mother) {
      return this.createChild(population);
    }
    const parents = [father, mother];
    const child: Direction[] = [];
    for (let i = 0; i < father.length; i++) {
      const parentPos = randomNumber(1);
      child.push(parents[parentPos][i]);
    }
    return child;
  }

  async findBestWay() {
    const population = this.makePopulation();
    const bestValuationPossible = 30 + this.maxMovements * 2;
    
    let best = null;
    let bestValuation = 0;

    const render = (cromossome: Direction[], index): void => {
      // const generation = parseInt((index / Maze.INITIAL_POPULATION_SIZE).toString());
      const generation = index < Maze.INITIAL_POPULATION_SIZE ? 0 : 1 + index - Maze.INITIAL_POPULATION_SIZE;
      const valuation = this.getValuation(cromossome);
      if (valuation > bestValuation) {
        best = cromossome;
        bestValuation = valuation;
      }
      console.log(`(Geracao ${generation}) (Cromossomo ${index}) ${cromossome.join(' ')} - Aptidao: ${valuation}/${bestValuation}/${bestValuationPossible}`);
    }
    
    population.forEach((cromossome, index) => {
      render(cromossome, index);
    });

    const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));
    while (bestValuation < bestValuationPossible) {
      const child = this.createChild(population);
      population.push(child);
      render(child, population.length - 1);
      await sleep(1);
    }
  }
}
