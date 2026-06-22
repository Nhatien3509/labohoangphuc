import { EMAIL_REGEX, PHONE_REGEX } from "@common/lib/core/const";
import { getOptionSchema } from "@common/lib/helpers/obj";
import { z } from "zod";

export const subscriptionSchema = (t: (key: string) => string) => {
  const requiredMessage = t("common.ask_questions.required_validator");
  const optionSchema = getOptionSchema(requiredMessage);

  return z.object({
    email: z
      .string()
      .min(1, {
        message: requiredMessage,
      })
      .trim()
      .refine((value) => EMAIL_REGEX.test(value), {
        message: t("subscribe.email_validator"),
      }),
    countryCode: optionSchema,
    phone: z
      .string()
      .min(1, {
        message: requiredMessage,
      })
      .trim()
      .refine((value) => PHONE_REGEX.test(value.padStart(10, "0")), {
        message: t("common.ask_questions.phone_number_validator"),
      }),
    question: z.string().trim().min(1, {
      message: requiredMessage,
    }),
  });
};

export type SubscriptionSchemaType = z.infer<
  ReturnType<typeof subscriptionSchema>
>;
