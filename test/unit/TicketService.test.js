import * as chai from "chai";
import sinon from "sinon";
import TicketPaymentService from "../../src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../../src/thirdparty/seatbooking/SeatReservationService.js";
import TicketService from "../../src/pairtest/TicketService.js";
import config from "../../src/config/config.js";
import InvalidPurchaseException from "../../src/pairtest/lib/InvalidPurchaseException.js";

const { expect } = chai;

describe("Ticket Service", () => {
  let ticketService;
  let ticketTypeRequestArray = [];
  let purchaseAttempt;
  let accountId;
  let ticketPaymentServiceMakePaymentSpy;
  let seatReservationServiceReserveSeatSpy;

  beforeEach(() => {
    ticketPaymentServiceMakePaymentSpy = sinon.spy(
      TicketPaymentService.prototype,
      "makePayment",
    );
    seatReservationServiceReserveSeatSpy = sinon.spy(
      SeatReservationService.prototype,
      "reserveSeat",
    );
    ticketService = new TicketService();
  });

  afterEach(() => {
    ticketPaymentServiceMakePaymentSpy.restore();
    seatReservationServiceReserveSeatSpy.restore();
  });

  context("When infant or child ticket is purchased", () => {
    it("should only be possible when an adult ticket is purchased", () => {
      accountId = 1;
      ticketTypeRequestArray = [
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
          noOfTickets: 6,
        },
      ];

      purchaseAttempt = () =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequestArray);

      try {
        purchaseAttempt();
      } catch (err) {
        expect(err).to.be.instanceof(InvalidPurchaseException);
        expect(err.message).to.equal(
          "infant or child tickets require purchase of adult ticket",
        );
      }
    });
  });

  context("When infants tickets are purchased", () => {
    it("should not charge them for a ticket", () => {
      accountId = 1;
      ticketTypeRequestArray = [
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
          noOfTickets: 5,
        },
      ];

      const adultPrice = config.ticketPrices.ADULT;
      const childPrice = config.ticketPrices.CHILD;
      const adultTicketRequest = ticketTypeRequestArray.find(
        (ticketType) => ticketType.type === "ADULT",
      );
      const childTicketRequest = ticketTypeRequestArray.find(
        (ticketType) => ticketType.type === "CHILD",
      );
      const totalAdultCost = adultTicketRequest.noOfTickets * adultPrice;
      const totalChildCost = childTicketRequest.noOfTickets * childPrice;

      const expectedPrice = totalAdultCost + totalChildCost;

      purchaseAttempt = ticketService.purchaseTickets(
        accountId,
        ...ticketTypeRequestArray,
      );

      expect(purchaseAttempt.receipt.totalPrice).to.equal(`£${expectedPrice}`);
    });

    it("should not allocate a seat for them", () => {
      accountId = 1;
      ticketTypeRequestArray = [
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
          noOfTickets: 5,
        },
      ];

      purchaseAttempt = ticketService.purchaseTickets(
        accountId,
        ...ticketTypeRequestArray,
      );

      const children = ticketTypeRequestArray.find(
        (ticketType) => ticketType.type === "CHILD",
      );
      const adults = ticketTypeRequestArray.find(
        (ticketType) => ticketType.type === "ADULT",
      );

      const expectedTotalSeats = children.noOfTickets + adults.noOfTickets;

      expect(purchaseAttempt.receipt.totalSeats).to.equal(expectedTotalSeats);
    });

    it("should not have more infant tickets than adult tickets as they all infants will be sitting on adults laps", () => {
      accountId = 1;
      ticketTypeRequestArray = [
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
          noOfTickets: 6,
        },
      ];

      purchaseAttempt = () =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequestArray);

      try {
        purchaseAttempt();
      } catch (err) {
        expect(err).to.be.instanceof(InvalidPurchaseException);
        expect(err.message).to.equal(
          "number of infant tickets exceeds number of adult tickets",
        );
      }
    });
  });

  context("When purchasing any type of ticket combination", () => {
    [
      "should allow multiple tickets to be purchased at the same time",
      "should allow the ticket purchaser to declare how many and what type of tickets they want to buy",
      "should allow 3 different types of tickets to be purchased",
    ].forEach((test) => {
      it(test, () => {
        accountId = 1;
        ticketTypeRequestArray = [
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
        ];

        purchaseAttempt = ticketService.purchaseTickets(
          accountId,
          ...ticketTypeRequestArray,
        );

        expect(purchaseAttempt.status).to.equal("confirmed");
      });
    });

    it("should only allow a maximum of 25 tickets to be purchased at once", () => {
      accountId = 1;
      ticketTypeRequestArray = [
        {
          type: "ADULT",
          noOfTickets: 20,
        },
        {
          type: "CHILD",
          noOfTickets: 19,
        },
        {
          type: "INFANT",
          noOfTickets: 18,
        },
      ];

      purchaseAttempt = () =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequestArray);

      try {
        purchaseAttempt();
      } catch (err) {
        expect(err).to.be.instanceof(InvalidPurchaseException);
        expect(err.message).to.equal(
          "number of tickets exceeds ticket maximum",
        );
      }

      expect(purchaseAttempt).to.throw(InvalidPurchaseException);
    });

    it("should have the correct price based on the type of ticket", () => {
      accountId = 1;
      ticketTypeRequestArray = [
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
      ];

      purchaseAttempt = ticketService.purchaseTickets(
        accountId,
        ...ticketTypeRequestArray,
      );

      const infantReceipt = purchaseAttempt.receipt.tickets.find(
        (item) => item.ticket === "INFANT",
      );
      const childReceipt = purchaseAttempt.receipt.tickets.find(
        (item) => item.ticket === "CHILD",
      );
      const adultReceipt = purchaseAttempt.receipt.tickets.find(
        (item) => item.ticket === "ADULT",
      );

      expect(purchaseAttempt.status).to.equal("confirmed");
      expect(infantReceipt.pricePerTicket).to.equal(0);
      expect(childReceipt.pricePerTicket).to.equal(15);
      expect(adultReceipt.pricePerTicket).to.equal(25);
    });
  });

  context("Handling any ticket purchase request", () => {
    it("should calculate the correct amount and make a request to TicketPaymentService", () => {
      accountId = 1;
      ticketTypeRequestArray = [
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
      ];

      purchaseAttempt = ticketService.purchaseTickets(
        accountId,
        ...ticketTypeRequestArray,
      );

      let calcPrice = 0;
      ticketTypeRequestArray.forEach((ticketTypeAndCount) => {
        calcPrice +=
          ticketTypeAndCount.noOfTickets *
          config.ticketPrices[ticketTypeAndCount.type];
      });

      expect(purchaseAttempt.receipt.totalPrice).to.equal(`£${calcPrice}`);
      expect(ticketPaymentServiceMakePaymentSpy.calledOnce).to.be.true;
      expect(
        ticketPaymentServiceMakePaymentSpy.calledWith(accountId, calcPrice),
      ).to.be.true;
    });

    it("should calculate the correct no of seats to reserve and makes a request to SeatReservationService", () => {
      accountId = 1;
      ticketTypeRequestArray = [
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
      ];

      purchaseAttempt = ticketService.purchaseTickets(
        accountId,
        ...ticketTypeRequestArray,
      );

      let calcSeats = 0;
      ticketTypeRequestArray.forEach((ticketTypeAndCount) => {
        if (ticketTypeAndCount.type != "INFANT") {
          calcSeats += ticketTypeAndCount.noOfTickets;
        }
      });

      expect(purchaseAttempt.receipt.totalSeats).to.equal(calcSeats);
      expect(seatReservationServiceReserveSeatSpy.calledOnce).to.be.true;
      expect(
        seatReservationServiceReserveSeatSpy.calledWith(accountId, calcSeats),
      ).to.be.true;
    });

    it("should reject any invalid ticket purchase requests where not an array", () => {
      accountId = 1;
      ticketTypeRequestArray = "string";

      purchaseAttempt = () =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequestArray);

      try {
        purchaseAttempt();
      } catch (err) {
        expect(err).to.be.instanceof(InvalidPurchaseException);
        expect(err.message).to.equal("ticket type request should be an array");
      }
    });

    it("should reject any invalid ticket purchase requests where not all values are provided", () => {
      accountId = 1;
      ticketTypeRequestArray = [
        {
          type: "ADULT",
          noOfTickets: 5,
        },
        {
          type: "INFANT",
          noOfTickets: 3,
        },
      ];

      purchaseAttempt = () =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequestArray);

      try {
        purchaseAttempt();
      } catch (err) {
        expect(err).to.be.instanceof(InvalidPurchaseException);
        expect(err.message).to.equal(
          `ticket type request should contain information for: ${config.expectedTicketTypes.join(" ")}`,
        );
      }
    });

    it("should reject any invalid ticket purchase requests where wrong type sent", () => {
      accountId = 1;
      ticketTypeRequestArray = [
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
        {
          type: "UNKNOWN",
          noOfTickets: 3,
        },
      ];

      purchaseAttempt = () =>
        ticketService.purchaseTickets(accountId, ...ticketTypeRequestArray);

      try {
        purchaseAttempt();
      } catch (err) {
        expect(err).to.be.instanceof(InvalidPurchaseException);
        expect(err.message).to.equal(`unknown ticket type: "UNKNOWN"`);
      }
    });

    [0, "wrong", { accountId: 1 }].forEach((testAccountId) => {
      it(`should have a valid account id and reject ${testAccountId}`, () => {
        ticketTypeRequestArray = [
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
        ];

        purchaseAttempt = () =>
          ticketService.purchaseTickets(
            testAccountId,
            ...ticketTypeRequestArray,
          );

        try {
          purchaseAttempt();
        } catch (err) {
          expect(err).to.be.instanceof(InvalidPurchaseException);
          expect(err.message).to.equal("accountId must be valid");
        }

        expect(purchaseAttempt).to.throw(InvalidPurchaseException);
      });
    });
  });

  it("should generate a receipt confirmation on success", () => {
    accountId = 1;
    ticketTypeRequestArray = [
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
    ];

    purchaseAttempt = ticketService.purchaseTickets(
      accountId,
      ...ticketTypeRequestArray,
    );

    expect(purchaseAttempt.status).to.equal("confirmed");
    expect(purchaseAttempt).to.haveOwnProperty("receipt");
    expect(typeof purchaseAttempt.receipt).to.equal("object");
    expect(purchaseAttempt.receipt).to.haveOwnProperty("tickets");
    expect(typeof purchaseAttempt.receipt.tickets).to.equal("object");
    expect(purchaseAttempt.receipt).to.haveOwnProperty("totalSeats");
    expect(purchaseAttempt.receipt).to.haveOwnProperty("totalPrice");
    expect(purchaseAttempt.receipt).to.haveOwnProperty("note");
  });
});
