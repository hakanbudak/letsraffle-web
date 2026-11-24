import { describe, expect, it } from "vitest";
import api, { CLIENT_HEADERS } from "./api";

describe("api client", () => {
    it("identifies the web app on every request", () => {
        expect(CLIENT_HEADERS["X-Client"]).toBe("web");
        expect(api.defaults.headers["X-Client"]).toBe("web");
    });
});
