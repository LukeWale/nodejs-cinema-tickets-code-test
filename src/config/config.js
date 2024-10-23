const config = {
  maxTickets: 25,
  expectedTicketTypes: ["INFANT", "CHILD", "ADULT"],
  ticketPrices: {
    INFANT: 0,
    CHILD: 15,
    ADULT: 25,
  },
  currency: "£",
  PORT: process.env.port || 8080,
};

export default config;
