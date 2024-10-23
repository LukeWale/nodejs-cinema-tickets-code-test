import * as chai from "chai";
import supertest from "supertest";
import { makeApp } from "../../../src/app.js";
import { makeLogger } from "../../../src/services/logger.js";
import { ticketRequestRouter } from "../../../src/routes/ticketRequest.router.js";
import config from "../../../src/config/config.js";

const { assert, expect } = chai;

describe("Ticket Request router", () => {
  let app;
  let logger;
  let server;
  let response;
  let expectedResponse;

  before((done) => {
    logger = makeLogger();
    app = makeApp({ logger });
    server = supertest.agent(app);
    done();
  });

  it("should be defined", () => {
    assert.isDefined(ticketRequestRouter);
  });

  it("should error on no body present", async () => {
    response = await server.post("/tickets/request").send();

    expectedResponse = {
      errors: [
        {
          code: "INVALID_FORMAT",
          field: "accountId",
        },
        {
          code: "INVALID_FORMAT",
          field: "ticketTypes",
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should validate against incorrect accountId", async () => {
    response = await server.post("/tickets/request").send({
      accountId: "string",
      ticketTypes: [
        {
          type: "ADULT",
          noOfTickets: 5,
        },
        {
          type: "CHILD",
          noOfTickets: 4,
        },
        {
          type: "INFANT",
          noOfTickets: 3,
        },
      ],
    });

    expectedResponse = {
      errors: [
        {
          code: "INVALID_FORMAT",
          field: "accountId",
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should validate against incorrect format ticketTypes", async () => {
    response = await server.post("/tickets/request").send({
      accountId: 123456,
      ticketTypes: "child",
    });

    expectedResponse = {
      errors: [
        {
          code: "INVALID_FORMAT",
          field: "ticketTypes",
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should accept valid values", async () => {
    response = await server.post("/tickets/request").send({
      accountId: 123456,
      ticketTypes: [
        {
          type: "ADULT",
          noOfTickets: 5,
        },
        {
          type: "CHILD",
          noOfTickets: 4,
        },
        {
          type: "INFANT",
          noOfTickets: 3,
        },
      ],
    });

    expectedResponse = {
      receipt: {
        note: "Please note, all infants must be sat on an adults lap. No seats are allocated for them",
        tickets: [
          {
            pricePerTicket: config.ticketPrices.ADULT,
            quantity: 5,
            ticket: "ADULT",
          },
          {
            pricePerTicket: config.ticketPrices.CHILD,
            quantity: 4,
            ticket: "CHILD",
          },
          {
            pricePerTicket: config.ticketPrices.INFANT,
            quantity: 3,
            ticket: "INFANT",
          },
        ],
        totalPrice: `£${config.ticketPrices.ADULT * 5 + config.ticketPrices.CHILD * 4}`,
        totalSeats: 9,
      },
      status: "confirmed",
    };

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should error when incompatible infant to adult amount", async () => {
    response = await server.post("/tickets/request").send({
      accountId: 123456,
      ticketTypes: [
        {
          type: "ADULT",
          noOfTickets: 5,
        },
        {
          type: "CHILD",
          noOfTickets: 4,
        },
        {
          type: "INFANT",
          noOfTickets: 10,
        },
      ],
    });

    expectedResponse = {
      errors: [
        {
          code: "NUMBER_OF_INFANT_TICKETS_EXCEEDS_NUMBER_OF_ADULT_TICKETS",
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should error when no adults", async () => {
    response = await server.post("/tickets/request").send({
      accountId: 123456,
      ticketTypes: [
        {
          type: "ADULT",
          noOfTickets: 0,
        },
        {
          type: "CHILD",
          noOfTickets: 4,
        },
        {
          type: "INFANT",
          noOfTickets: 10,
        },
      ],
    });

    expectedResponse = {
      errors: [
        {
          code: "INFANT_OR_CHILD_TICKETS_REQUIRE_PURCHASE_OF_ADULT_TICKET",
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should error when no adults", async () => {
    response = await server.post("/tickets/request").send({
      accountId: 0,
      ticketTypes: [
        {
          type: "ADULT",
          noOfTickets: 10,
        },
        {
          type: "CHILD",
          noOfTickets: 4,
        },
        {
          type: "INFANT",
          noOfTickets: 10,
        },
      ],
    });

    expectedResponse = {
      errors: [
        {
          code: "ACCOUNTID_MUST_BE_VALID",
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should error for missing adult request", async () => {
    response = await server.post("/tickets/request").send({
      accountId: 1,
      ticketTypes: [
        {
          type: "CHILD",
          noOfTickets: 4,
        },
        {
          type: "INFANT",
          noOfTickets: 10,
        },
      ],
    });

    expectedResponse = {
      errors: [
        {
          code: "TICKET_TYPE_REQUEST_SHOULD_CONTAIN_INFORMATION_FOR:_INFANT_CHILD_ADULT",
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should error for wrong type request", async () => {
    response = await server.post("/tickets/request").send({
      accountId: 1,
      ticketTypes: [
        {
          type: "ADULT",
          noOfTickets: 4,
        },
        {
          type: "WRONG",
          noOfTickets: 4,
        },
        {
          type: "CHILD",
          noOfTickets: 4,
        },
        {
          type: "INFANT",
          noOfTickets: 10,
        },
      ],
    });

    expectedResponse = {
      errors: [
        {
          code: 'UNKNOWN_TICKET_TYPE:_"WRONG"',
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });

  it("should error for wrong type request", async () => {
    response = await server.post("/tickets/request").send({
      accountId: 1,
      ticketTypes: [
        {
          type: "ADULT",
          noOfTickets: 100,
        },
        {
          type: "CHILD",
          noOfTickets: 4,
        },
        {
          type: "INFANT",
          noOfTickets: 10,
        },
      ],
    });

    expectedResponse = {
      errors: [
        {
          code: "NUMBER_OF_TICKETS_EXCEEDS_TICKET_MAXIMUM",
        },
      ],
    };

    expect(response.status).to.equal(400);
    expect(response.body).to.deep.equal(expectedResponse);
  });
});
