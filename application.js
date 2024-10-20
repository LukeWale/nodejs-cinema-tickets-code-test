import TicketService from "./src/pairtest/TicketService.js";

export const application = ({ accountId, ticketTypeRequestArray }) => {
  const ticketService = new TicketService();

  const purchaseAttempt = ticketService.purchaseTickets(
    accountId,
    ...ticketTypeRequestArray,
  );

  console.log(JSON.stringify(purchaseAttempt));
};
