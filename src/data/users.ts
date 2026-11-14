import { randomUUID } from 'node:crypto';

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/** A user with a unique email, so tests never collide with each other. */
export function newUser(overrides: Partial<TestUser> = {}): TestUser {
  const suffix = randomUUID().slice(0, 8);
  return {
    name: 'Anna Ivanova',
    email: `anna.${suffix}@example.com`,
    password: 'Secret123!',
    ...overrides,
  };
}

export interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  zip: string;
}

export interface CardDetails {
  number: string;
  expiry: string;
  cvc: string;
}

export const VALID_SHIPPING: ShippingDetails = {
  name: 'Anna Ivanova',
  email: 'anna@example.com',
  phone: '+4915112345678',
  country: 'Germany',
  city: 'Berlin',
  street: 'Hauptstrasse 1',
  zip: '10115',
};

export const VALID_CARD: CardDetails = {
  number: '4242 4242 4242 4242',
  expiry: '12/30',
  cvc: '123',
};
