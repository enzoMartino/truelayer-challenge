export interface FunTranslationsResponse {
  success: {
    total: number;
  };
  contents: {
    translated: string;
    text: string;
    translation: string;
  };
}
