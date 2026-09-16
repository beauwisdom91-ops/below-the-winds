import books from "../../../data/books.json";

export const shippingCents = 499;

export type Book = {
  id: string;
  title: string;
  author: string;
  shelf: string;
  price: number;
  condition: string;
  note?: string;
  isbn10?: string;
  isbn13?: string;
  featured?: boolean;
  status?: string;
  sku?: string;
  amazonUrl?: string;
};

export function allBooks(): Book[] {
  return books as Book[];
}

export function getBook(id: string | undefined): Book | undefined {
  if (!id) return undefined;
  return allBooks().find((b) => b.id === id);
}

export function bookAmountCents(book: Book): number {
  return Math.round(Number(book.price) * 100);
}
