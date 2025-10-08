import { protectedProcedure } from "../../../create-context";
import { validateLicense } from "../../../../utils/license";

export default protectedProcedure.query(async ({ ctx }) => {
  const validation = await validateLicense(ctx.user.ownerId);

  return {
    isValid: validation.isValid,
    error: validation.error,
    renewUrl: validation.renewUrl,
    license: validation.license
      ? {
          plan: validation.license.plan,
          status: validation.license.status,
          expiryDate: validation.license.expiryDate,
          features: JSON.parse(validation.license.features),
        }
      : null,
  };
});
