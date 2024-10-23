import { describe, it } from "mocha";
import * as chai from "chai";
import supertest from "supertest";

import { makeApp } from "../../src/app.js";
import { makeLogger } from "../../src/services/logger.js";

const { expect } = chai;

describe("app.js", () => {
  let logger;
  let app;
  let server;
  let response;
  let expectedResponse;

  before((done) => {
    logger = makeLogger();
    app = makeApp({ logger });
    server = supertest.agent(app);
    done();
  });

  it("makeApp is defined", () => {
    expect(makeApp).not.to.be.undefined;
  });

  it("returns default application message on webpage view", async () => {
    response = await server.get("/");

    expectedResponse = {
      message: "Application home",
    };

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("returns a 404 on unknown endpoint", async () => {
    response = await server.get("/deliberatelyIncorrectURL/trigger/not-found");

    expectedResponse = {
      message: "Unknown endpoint",
    };

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal(expectedResponse);
  });
});
