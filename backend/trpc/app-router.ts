import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import registerOwnerRoute from "./routes/owner/register/route";
import loginOwnerRoute from "./routes/owner/login/route";
import createAdminRoute from "./routes/admin/create/route";
import loginAdminRoute from "./routes/admin/login/route";
import createStaffRoute from "./routes/staff/create/route";
import loginStaffRoute from "./routes/staff/login/route";
import createCustomerRoute from "./routes/customer/create/route";
import listCustomersRoute from "./routes/customer/list/route";
import getCustomerDebtsRoute from "./routes/customer/get-debts/route";
import createTransactionRoute from "./routes/transaction/create/route";
import getLicenseStatusRoute from "./routes/license/get-status/route";
import renewLicenseRoute from "./routes/license/renew/route";
import verifyLicenseRoute from "./routes/license/verify/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  owner: createTRPCRouter({
    register: registerOwnerRoute,
    login: loginOwnerRoute,
  }),
  admin: createTRPCRouter({
    create: createAdminRoute,
    login: loginAdminRoute,
  }),
  staff: createTRPCRouter({
    create: createStaffRoute,
    login: loginStaffRoute,
  }),
  customer: createTRPCRouter({
    create: createCustomerRoute,
    list: listCustomersRoute,
    getDebts: getCustomerDebtsRoute,
  }),
  transaction: createTRPCRouter({
    create: createTransactionRoute,
  }),
  license: createTRPCRouter({
    getStatus: getLicenseStatusRoute,
    renew: renewLicenseRoute,
    verify: verifyLicenseRoute,
  }),
});

export type AppRouter = typeof appRouter;
