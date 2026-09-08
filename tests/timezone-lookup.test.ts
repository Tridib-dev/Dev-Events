import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { resolveEventTimezone } from "../lib/geo/timezone-lookup";

describe("resolveEventTimezone", () => {
  const originalFetch = globalThis.fetch;
  const originalUsername = process.env.GEONAMES_USERNAME;

  beforeEach(() => {
    vi.restoreAllMocks();

    // Give GeoNames a fake username so the request path is exercised.
    process.env.GEONAMES_USERNAME = "test-geonames-user";

    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;

    if (originalUsername === undefined) {
      delete process.env.GEONAMES_USERNAME;
    } else {
      process.env.GEONAMES_USERNAME = originalUsername;
    }
  });

  // ---------------------------------------------------------------------------
  // HELPER
  // ---------------------------------------------------------------------------

  function mockGeoNamesSuccess(timezone: string) {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          geonames: [
            {
              timezone: {
                timeZoneId: timezone,
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
  }

  function mockGeoNamesEmpty() {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          geonames: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
  }

  function mockGeoNamesFailure(status = 500) {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response("Internal Server Error", {
        status,
      })
    );
  }

  function mockGeoNamesNetworkFailure() {
    vi.mocked(globalThis.fetch).mockRejectedValue(
      new Error("Network error")
    );
  }

  // ===========================================================================
  // 1. GEO NAMES SUCCESS
  // ===========================================================================

  describe("GeoNames resolution", () => {
    it("returns the GeoNames timezone when GeoNames succeeds", async () => {
      mockGeoNamesSuccess("Asia/Kolkata");

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("returns an American timezone correctly", async () => {
      mockGeoNamesSuccess("America/New_York");

      const result = await resolveEventTimezone(
        "US",
        "NY",
        "New York"
      );

      expect(result).toBe("America/New_York");
    });

    it("returns a European timezone correctly", async () => {
      mockGeoNamesSuccess("Europe/London");

      const result = await resolveEventTimezone(
        "GB",
        "ENG",
        "London"
      );

      expect(result).toBe("Europe/London");
    });

    it("returns an Asian timezone correctly", async () => {
      mockGeoNamesSuccess("Asia/Tokyo");

      const result = await resolveEventTimezone(
        "JP",
        "13",
        "Tokyo"
      );

      expect(result).toBe("Asia/Tokyo");
    });

    it("returns the exact IANA timezone string without modification", async () => {
      mockGeoNamesSuccess("America/Los_Angeles");

      const result = await resolveEventTimezone(
        "US",
        "CA",
        "Los Angeles"
      );

      expect(result).toBe("America/Los_Angeles");
    });
  });

  // ===========================================================================
  // 2. GEO NAMES API FAILURES → OFFLINE FALLBACK
  // ===========================================================================

  describe("GeoNames failure and offline fallback", () => {
    it("falls back to offline lookup when GeoNames returns 500", async () => {
      mockGeoNamesFailure(500);

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("falls back when GeoNames returns 404", async () => {
      mockGeoNamesFailure(404);

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("falls back when GeoNames returns 429 rate limit", async () => {
      mockGeoNamesFailure(429);

      const result = await resolveEventTimezone(
        "IN",
        "MH",
        "Mumbai"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("falls back when GeoNames returns 503", async () => {
      mockGeoNamesFailure(503);

      const result = await resolveEventTimezone(
        "IN",
        "DL",
        "New Delhi"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("falls back when GeoNames throws a network error", async () => {
      mockGeoNamesNetworkFailure();

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("falls back when GeoNames returns an empty geonames array", async () => {
      mockGeoNamesEmpty();

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("falls back when GeoNames response has no timezone", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({
            geonames: [
              {
                name: "Kolkata",
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      );

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("falls back when GeoNames returns malformed JSON", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response("{this-is-not-valid-json", {
          status: 200,
        })
      );

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });
  });

  // ===========================================================================
  // 3. REAL CITIES / DIFFERENT TIMEZONES
  // ===========================================================================

  describe("known city resolutions through fallback", () => {
    beforeEach(() => {
      mockGeoNamesNetworkFailure();
    });

    it("resolves Kolkata to Asia/Kolkata", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("resolves Mumbai to Asia/Kolkata", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "MH",
        "Mumbai"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("resolves New Delhi to Asia/Kolkata", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "DL",
        "New Delhi"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("resolves Bengaluru to Asia/Kolkata", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "KA",
        "Bengaluru"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("resolves New York to America/New_York", async () => {
      const result = await resolveEventTimezone(
        "US",
        "NY",
        "New York City"
      );

      expect(result).toBe("America/New_York");
    });

    it("resolves Los Angeles to America/Los_Angeles", async () => {
      const result = await resolveEventTimezone(
        "US",
        "CA",
        "Los Angeles"
      );

      expect(result).toBe("America/Los_Angeles");
    });

    it("resolves London to Europe/London", async () => {
      const result = await resolveEventTimezone(
        "GB",
        "ENG",
        "London"
      );

      expect(result).toBe("Europe/London");
    });

    it("resolves Tokyo to Asia/Tokyo", async () => {
      const result = await resolveEventTimezone(
        "JP",
        "13",
        "Tokyo"
      );

      expect(result).toBe("Asia/Tokyo");
    });
  });

  // ===========================================================================
  // 4. INVALID LOCATION INPUTS
  // ===========================================================================

  describe("invalid location input", () => {
    beforeEach(() => {
      mockGeoNamesNetworkFailure();
    });

    it("returns null for a nonexistent city", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Definitely Not A Real City"
      );

      expect(result).toBeNull();
    });

    it("returns null for an invalid country code", async () => {
      const result = await resolveEventTimezone(
        "XX",
        "YY",
        "Unknown City"
      );

      expect(result).toBeNull();
    });

    it("returns null for an invalid state code", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "INVALID",
        "Kolkata"
      );

      expect(result).toBeNull();
    });

    it("returns null for an empty city name", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "WB",
        ""
      );

      expect(result).toBeNull();
    });

    it("returns null for an empty country code", async () => {
      const result = await resolveEventTimezone(
        "",
        "WB",
        "Kolkata"
      );

      expect(result).toBeNull();
    });

    it("returns null for an empty state code", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "",
        "Kolkata"
      );

      expect(result).toBeNull();
    });

    it("handles whitespace-only city input without crashing", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "   "
      );

      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // 5. CASE / EXACT CITY NAME BEHAVIOR
  // ===========================================================================

  describe("city name matching", () => {
    beforeEach(() => {
      mockGeoNamesNetworkFailure();
    });

    it("resolves the canonical city name", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("does not crash for a differently cased city name", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "KOLKATA"
      );

      // Current implementation uses exact city matching.
      // Therefore this is expected to fall through.
      expect(result).toBeNull();
    });

    it("does not crash for a city name with surrounding whitespace", async () => {
      const result = await resolveEventTimezone(
        "IN",
        "WB",
        " Kolkata "
      );

      // Current implementation uses exact city matching.
      expect(result).toBe("Asia/Kolkata");
    });
  });

  // ===========================================================================
  // 6. GEO NAMES ENVIRONMENT VARIABLE
  // ===========================================================================

  describe("GeoNames environment variable", () => {
    it("does not call GeoNames when username is missing", async () => {
      delete process.env.GEONAMES_USERNAME;

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("does not call GeoNames when username is empty", async () => {
      process.env.GEONAMES_USERNAME = "";

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("does not call GeoNames when the local timezone can be resolved", async () => {
      process.env.GEONAMES_USERNAME = "test-user";

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );
    
      expect(result).toBe("Asia/Kolkata");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 7. GEO NAMES REQUEST FORMAT
  // ===========================================================================

  describe("GeoNames request", () => {
    it("uses GeoNames when local timezone resolution fails", async () => {
      process.env.GEONAMES_USERNAME = "test-user";

      mockGeoNamesSuccess("Europe/London");

      const result = await resolveEventTimezone(
        "ZZ",
        "ZZ",
        "London Test City"
      );
    
      expect(result).toBe("Europe/London");
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    
      const [calledUrl] =
        vi.mocked(globalThis.fetch).mock.calls[0];
    
      const url = new URL(String(calledUrl));
    
      expect(url.hostname).toBe("api.geonames.org");
      expect(url.pathname).toBe("/searchJSON");
      expect(url.searchParams.get("name")).toBe(
        "London Test City"
      );
      expect(url.searchParams.get("country")).toBe("ZZ");
      expect(url.searchParams.get("maxRows")).toBe("1");
      expect(url.searchParams.get("username")).toBe(
        "test-user"
      );
    });

    it("URL-encodes city names correctly", async () => {
      mockGeoNamesSuccess("Europe/Paris");

      await resolveEventTimezone(
        "FR",
        "IDF",
        "Paris & Friends"
      );

      const [calledUrl] = vi.mocked(globalThis.fetch).mock.calls[0];

      expect(String(calledUrl)).toContain(
        "name=Paris+%26+Friends"
      );
    });
  });

  // ===========================================================================
  // 8. GEO NAMES RESPONSE SHAPE EDGE CASES
  // ===========================================================================

  describe("malformed GeoNames responses", () => {
    it("handles missing geonames property", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({}),
          { status: 200 }
        )
      );

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("handles null geonames", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({
            geonames: null,
          }),
          { status: 200 }
        )
      );

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("handles null timezone", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({
            geonames: [
              {
                timezone: null,
              },
            ],
          }),
          { status: 200 }
        )
      );

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("handles empty timeZoneId", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({
            geonames: [
              {
                timezone: {
                  timeZoneId: "",
                },
              },
            ],
          }),
          { status: 200 }
        )
      );

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });

    it("uses the first GeoNames result", async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue(
        new Response(
          JSON.stringify({
            geonames: [
              {
                timezone: {
                  timeZoneId: "Asia/Kolkata",
                },
              },
              {
                timezone: {
                  timeZoneId: "America/New_York",
                },
              },
            ],
          }),
          { status: 200 }
        )
      );

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(result).toBe("Asia/Kolkata");
    });
  });

  // ===========================================================================
  // 9. RETURN TYPE / SAFETY
  // ===========================================================================

  describe("return value safety", () => {
    it("returns a string when a timezone is found", async () => {
      mockGeoNamesSuccess("Asia/Kolkata");

      const result = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      expect(typeof result).toBe("string");
    });

    it("returns null instead of undefined when nothing is found", async () => {
      mockGeoNamesEmpty();

      const result = await resolveEventTimezone(
        "XX",
        "YY",
        "Unknown City"
      );

      expect(result).toBeNull();
    });

    it("never returns an empty string when resolution fails", async () => {
      mockGeoNamesEmpty();

      const result = await resolveEventTimezone(
        "XX",
        "YY",
        "Unknown City"
      );

      expect(result).not.toBe("");
    });
  });

  // ===========================================================================
  // 10. MULTIPLE RESOLUTIONS
  // ===========================================================================

  describe("repeated calls", () => {
    it("can resolve multiple cities independently", async () => {
      vi.mocked(globalThis.fetch)
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              geonames: [
                {
                  timezone: {
                    timeZoneId: "Asia/Kolkata",
                  },
                },
              ],
            }),
            { status: 200 }
          )
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              geonames: [
                {
                  timezone: {
                    timeZoneId: "America/New_York",
                  },
                },
              ],
            }),
            { status: 200 }
          )
        );

      const kolkata = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      const newYork = await resolveEventTimezone(
        "US",
        "NY",
        "New York City"
      );

      expect(kolkata).toBe("Asia/Kolkata");
      expect(newYork).toBe("America/New_York");
    });

    it("does not leak one result into another call", async () => {
      mockGeoNamesNetworkFailure();

      const first = await resolveEventTimezone(
        "IN",
        "WB",
        "Kolkata"
      );

      const second = await resolveEventTimezone(
        "XX",
        "YY",
        "Unknown City"
      );

      expect(first).toBe("Asia/Kolkata");
      expect(second).toBeNull();
    });
  });

  // ===========================================================================
  // 11. IMPORTANT REGRESSION TESTS
  // ===========================================================================

  describe("regression protection", () => {
    it("does not silently use a browser timezone", async () => {
      mockGeoNamesNetworkFailure();

      const result = await resolveEventTimezone(
        "XX",
        "YY",
        "Unknown City"
      );

      expect(result).toBeNull();
    });

    it("does not throw when both resolution mechanisms fail", async () => {
      mockGeoNamesNetworkFailure();

      await expect(
        resolveEventTimezone(
          "XX",
          "YY",
          "Unknown City"
        )
      ).resolves.toBeNull();
    });

    it("does not depend on browser timezone APIs", async () => {
      mockGeoNamesNetworkFailure();

      const dateResolvedTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      const result = await resolveEventTimezone(
        "XX",
        "YY",
        "Unknown City"
      );

      expect(result).toBeNull();

      // This assertion documents the intended architecture:
      // browser timezone must not become the fallback.
      expect(result).not.toBe(dateResolvedTimezone);
    });
  });
});