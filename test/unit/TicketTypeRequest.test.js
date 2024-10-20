import * as chai from "chai";
import TicketTypeRequest from "../../src/pairtest/lib/TicketTypeRequest.js";

const { expect } = chai;

describe("Ticket Type Request", () => {
  let ticketRequest;

  context(
    "Contraint: The `TicketTypeRequest` MUST be an immutable object",
    () => {
      it("should not change once set", () => {
        ticketRequest = new TicketTypeRequest("ADULT", 5);

        ticketRequest["#type"] = "CHILD";
        ticketRequest["#noOfTickets"] = 20;
        ticketRequest.type = "CHILD";
        ticketRequest.noOfTickets = 20;

        expect(ticketRequest.getTicketType()).to.equal("ADULT");
        expect(ticketRequest.getNoOfTickets()).to.equal(5);
      });
    },
  );

  ["adult", "child", "infant"].forEach((typeToTest) => {
    it(`Type: Should only allow uppercase value of ${typeToTest}`, () => {
      // Wrap in a function to be able to use expect against the responding action
      ticketRequest = () => new TicketTypeRequest(typeToTest, 5);

      expect(ticketRequest).to.throw(
        TypeError,
        "type must be ADULT, CHILD, or INFANT",
      );
    });
  });

  ["five", "5", { noOfTickets: 5 }].forEach((typeToTest) => {
    it("Type: Should only allow integer value for noOfTickets", () => {
      // Wrap in a function to be able to use expect against the responding action
      ticketRequest = () => new TicketTypeRequest("ADULT", typeToTest);

      expect(ticketRequest).to.throw(
        TypeError,
        "noOfTickets must be an integer",
      );
    });
  });
});
