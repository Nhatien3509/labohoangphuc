import ReCAPTCHA from "react-google-recaptcha";

import React from "react";
import { useParams } from "next/navigation";

const ReCAPTCHAButton = ({
  onVerify,
}: {
  onVerify: (token: string | null) => void;
}) => {
  const { locale } = useParams<{ locale: string }>();

  // Billing module removed — reCaptchaSiteKey sourced from env or empty string
  const reCaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

  return (
    <ReCAPTCHA sitekey={reCaptchaSiteKey} onChange={onVerify} hl={locale} />
  );
};

export default ReCAPTCHAButton;
