export abstract class TranslationRepository {
  abstract translate(
    text: string,
    strategy: 'yoda' | 'shakespeare',
  ): Promise<string>;
}
