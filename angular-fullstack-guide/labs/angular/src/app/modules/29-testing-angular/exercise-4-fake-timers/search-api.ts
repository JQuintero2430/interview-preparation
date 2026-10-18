/** The port to the search backend; a test provides a double at this class. */
export abstract class SearchApi {
  abstract search(term: string): Promise<string[]>;
}
