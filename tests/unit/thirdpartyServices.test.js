import * as chai from "chai";
import { getFileContentsHelper, trimHelper } from "../helpers/index.js";

const { expect } = chai;

describe("Third Party Services", () => {
  let filePath;
  let fileContents;
  let expectedContents;

  context(
    "Constraint: The code in the thirdparty.* packages CANNOT be modified.",
    () => {
      it("should not have a modified TicketPaymentService.js", async () => {
        filePath = "./src/thirdparty/paymentgateway/TicketPaymentService.js";

        expectedContents = `
          /* eslint-disable */

          export default class TicketPaymentService {
            makePayment(accountId, totalAmountToPay) {
              if (!Number.isInteger(accountId)) {
                throw new TypeError('accountId must be an integer');
              }

              if (!Number.isInteger(totalAmountToPay)) {
                throw new TypeError('totalAmountToPay must be an integer');
              }
            }
          }
        `;

        fileContents = await getFileContentsHelper(filePath);

        expect(trimHelper(fileContents)).to.equal(trimHelper(expectedContents));
      });

      it("should not have a modified SeatReservationService.js", async () => {
        filePath = "./src/thirdparty/seatbooking/SeatReservationService.js";

        expectedContents = `
          /* eslint-disable */

          export default class SeatReservationService {
            reserveSeat(accountId, totalSeatsToAllocate) {
              if (!Number.isInteger(accountId)) {
                throw new TypeError('accountId must be an integer');
              }

              if (!Number.isInteger(totalSeatsToAllocate)) {
                throw new TypeError('totalSeatsToAllocate must be an integer');
              }
            }
          }
        `;

        fileContents = await getFileContentsHelper(filePath);

        expect(trimHelper(fileContents)).to.equal(trimHelper(expectedContents));
      });
    },
  );
});
