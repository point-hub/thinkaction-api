export interface IOpenaiConfig {
  apiKey: string
}

export const apiKey = process.env['OPENAI_API_KEY'] ?? '';

const openaiConfig: IOpenaiConfig = { apiKey };

export default openaiConfig;
