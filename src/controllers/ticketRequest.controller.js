import TicketService from "../pairtest/TicketService.js";

export const ticketRequest = () => async (req, res) => {
  const ticketService = new TicketService();

  try {
    const ticketPurchaseRequest = ticketService.purchaseTickets(
      req.body.accountId,
      ...req.body.ticketTypes,
    );
    return res.status(200).send(ticketPurchaseRequest);
  } catch (err) {
    return res.status(400).send({
      errors: [
        {
          code: err.message.replace(/\s+/g, "_").toUpperCase(),
        },
      ],
    });
  }
};
