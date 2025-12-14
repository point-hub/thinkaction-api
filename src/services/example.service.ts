export interface IExampleService {
  say(word: string): string
}

export const ExampleService: IExampleService = {
  say(word: string) {
    return word;
  },
};
