import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { parseUsAddress, toSale } = await import("./notion-meta-sync");

describe("parseUsAddress", () => {
  it("reads city, state and zip from a typical US address", () => {
    expect(parseUsAddress("1234 W Lawrence Ave, Chicago, IL 60640")).toEqual({
      city: "Chicago",
      state: "IL",
      zip: "60640",
    });
    expect(parseUsAddress("55 Main St Apt 2, Staten Island NY 10301-1234")).toEqual({
      city: "Staten Island",
      state: "NY",
      zip: "10301",
    });
  });

  it("returns nothing for free text it cannot trust", () => {
    expect(parseUsAddress("Чикаго, самовывоз")).toEqual({});
  });
});

describe("toSale", () => {
  const page = (props: Record<string, unknown>) => ({
    id: "page-1",
    created_time: "2026-09-20T10:00:00.000Z",
    properties: props as never,
  });

  it("skips cards without a price", () => {
    expect(toSale(page({ "Ціна $": { number: null } }))).toBeNull();
  });

  it("maps the CRM fields", () => {
    const sale = toSale(
      page({
        "Ціна $": { number: 208 },
        Date: { date: { start: "2026-09-25" } },
        Name: { title: [{ plain_text: "Ivan Petrenko" }] },
        Email: { email: "a@b.co" },
        "Телефон": { phone_number: "(312) 555-0101" },
        "Адреса": { rich_text: [{ plain_text: "1 Oak St, Naperville, IL 60540" }] },
      }),
    );
    expect(sale).toMatchObject({
      valueUsd: 208,
      name: "Ivan Petrenko",
      email: "a@b.co",
      state: "IL",
      zip: "60540",
    });
    expect(sale?.paidAt.toISOString()).toBe("2026-09-25T00:00:00.000Z");
  });
});
