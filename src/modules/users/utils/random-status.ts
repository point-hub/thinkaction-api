import statusData from './random-status.json';

export interface IRandomStatusService {
  get(): string
}

export const RandomStatusService: IRandomStatusService = {
  get() {
    // Math.random() generates a float between 0 (inclusive) and 1 (exclusive).
    // Multiplying by length gives a number between 0 and length (exclusive).
    // Math.floor() converts it to a valid integer index.
    const randomIndex = Math.floor(Math.random() * statusData.statuses.length);

    // Return the Random Status
    return statusData.statuses[randomIndex];
  },
};
