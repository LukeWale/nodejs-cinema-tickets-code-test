describe("Ticket Service", () => {
  context("When infant or child ticket is purchased", () => {
    it("should only be possible when an adult ticket is purchased", () => {});
  });

  context("When infants tickets are purchased", () => {
    it("should not charge them for a ticket", () => {});

    it("should not allocate a seat for them", () => {});

    it("should not have more infant tickets than adult tickets as they all infants will be sitting on adults laps", () => {});
  });

  context("When purchasing any type of ticket combination", () => {
    it("should allow multiple tickets to be purchased at the same time", () => {});

    it("should allow the ticket purchaser to declare how many and what type of tickets they want to buy", () => {});

    it("should only allow a maximum of 25 tickets to be purchased at once", () => {});

    it("should allow 3 different types of tickets to be purchased", () => {});

    it("should have the correct price based on the type of ticket", () => {});
  });

  context("Handling any ticket purchase request", () => {
    it("should calculate the correct amount and make a request to TicketPaymentService", () => {});

    it("should calculate the correct no of seats to reserve and makes a request to SeatReservationService", () => {});

    it("should reject any invalid ticket purchase requests", () => {});

    it("should have a valid account id", () => {});
  });
});
