/**
 * IDs on inka.vn for this app. Filled in by `node scripts/setup-inka.mjs`
 * (run it on a network that can reach inka.vn ports 8000–8063, e.g. 4G).
 *
 * While ordersTable is empty the app keeps orders on the device only
 * (the original demo behaviour); sign-in still goes to the server.
 */
export const INKA = {
  dbId: '00000000001d0080',
  ordersTable: '00000000001d0100',
  /** Customers must join the database before they can write orders. */
  joinOnSignIn: false,
};

export const ordersOnServer = () => INKA.ordersTable !== '';
