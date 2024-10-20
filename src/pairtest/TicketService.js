import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';

import config from '../config/config.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

const { expectedTicketTypes } = config;
export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException

    // validateAccountId
    const validatedAccountId = this.#validateAccount(accountId);

    // check requested information is valid
    const validatedSentRequest = this.#validateSentRequest(ticketTypeRequests);

    // generate new ticket requests
    const validatedTicketRequests = this.#generateNewTicketRequests(ticketTypeRequests)

    // validate infant and child rules and requirements
    const validatedDependentQuantity = this.#validateDependentstoAdults(validatedTicketRequests);

    // calculate the total price
    const calculatedTotalPrice = this.#calculateTotalPrice(validatedTicketRequests);

    // calculate the total number of seats required
    const calculatedTotalSeats = this.#calculateTotalSeats(validatedTicketRequests);

    // Make payment
    const paymentConducter = new TicketPaymentService;
    paymentConducter.makePayment(validatedAccountId, calculatedTotalPrice);

    // Reserve seats
    const seatReservationConductor = new SeatReservationService;
    seatReservationConductor.reserveSeat(validatedAccountId, calculatedTotalSeats);

    // Generate receipt
    const receipt = this.#generateReceipt(calculatedTotalSeats, calculatedTotalPrice, config.ticketPrices, ticketTypeRequests, validatedDependentQuantity);

    return receipt;
  }

  #validateSentRequest = (ticketTypeRequests) => {
    if (typeof ticketTypeRequests[0] === "string") {
      throw new InvalidPurchaseException("ticket type request should be an array");
    }

    expectedTicketTypes.forEach((ticketType) => {
      const hasRequestForTicketType = ticketTypeRequests.some((request) => request.type === ticketType);

      if (!hasRequestForTicketType) {
        throw new InvalidPurchaseException(`ticket type request should contain information for: ${expectedTicketTypes.join(" ")}`);
      }
    });

    const unknownItem = ticketTypeRequests.find((request) => !expectedTicketTypes.includes(request.type));

    if (unknownItem) {
      throw new InvalidPurchaseException(`unknown ticket type: "${unknownItem.type}"`);
    }
  }

  #validateAccount = (accountId) => {
    if (
      typeof(accountId) != "number" ||
      accountId == 0
    ) {
      throw new InvalidPurchaseException("accountId must be valid");
    }

    return accountId;
  }

  #generateNewTicketRequests = (ticketTypeRequests) => {
    const ticketRequests = [];

    ticketTypeRequests.forEach((singleTicketTypeRequest) => {
      const { type, noOfTickets } = singleTicketTypeRequest;

      let individualRequest = new TicketTypeRequest(type, noOfTickets);
      ticketRequests.push(individualRequest);
    });

    this.#validateTicketQuantity(ticketRequests);

    return ticketRequests;
  }

  #validateTicketQuantity = (ticketRequests) => {
    let totalNumberOfTickets = 0;

    ticketRequests.forEach((ticketRequest) => {
      totalNumberOfTickets += ticketRequest.getNoOfTickets();
    });

    if (totalNumberOfTickets > config.maxTickets) {
      throw new InvalidPurchaseException("number of tickets exceeds ticket maximum")
    }

    return true;
  };

  #validateDependentstoAdults = (ticketRequests) => {
    const infant = ticketRequests.find((ticketRequest) => ticketRequest.getTicketType() === "INFANT");
    const adult = ticketRequests.find((ticketRequest) => ticketRequest.getTicketType() === "ADULT");
    let infantNote;

    if (adult.getNoOfTickets() === 0) {
      throw new InvalidPurchaseException("infant or child tickets require purchase of adult ticket")
    }

    if (infant.getNoOfTickets() > adult.getNoOfTickets()) {
      throw new InvalidPurchaseException("number of infant tickets exceeds number of adult tickets")
    }

    if (infant.getNoOfTickets() > 0) {
      infantNote = "Please note, all infants must be sat on an adults lap. No seats are allocated for them";
    }

    return {
      validated: true,
      infantNote
    }
  }

  #calculateTotalPrice = (ticketRequests) => {
    let totalPrice = 0;

    ticketRequests.forEach((ticketRequest) => {
      totalPrice += ( ticketRequest.getNoOfTickets() * config.ticketPrices[ticketRequest.getTicketType()]);
    });

    return totalPrice;
  }

  #calculateTotalSeats = (ticketRequests) => {
    let totalSeats = 0;

    ticketRequests.forEach((ticketRequest) => {
      if (ticketRequest.getTicketType() != "INFANT") {
        totalSeats += ticketRequest.getNoOfTickets();
      }
    });

    return totalSeats;
  }

  #generateReceipt = (calculatedTotalSeats, calculatedTotalPrice, ticketPrices, ticketTypeRequests, validatedDependentQuantity) => {
    const tickets = [];

    ticketTypeRequests.forEach((ticketRequest) => {
      const ticketQuantityWithPrice = {
        ticket: ticketRequest.type,
        quantity: ticketRequest.noOfTickets,
        pricePerTicket: ticketPrices[ticketRequest.type],
      };

      tickets.push(ticketQuantityWithPrice);
    })

    const response = {
      status: "confirmed",
      receipt: {
        tickets,
        totalSeats: calculatedTotalSeats,
        totalPrice: `£${calculatedTotalPrice}`,
      },
    }

    if (validatedDependentQuantity.infantNote) {
      response.receipt.note = validatedDependentQuantity.infantNote;
    }

    return response;
  }

}
